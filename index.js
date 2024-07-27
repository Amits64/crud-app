const express = require('express');
const mysql = require('mysql2/promise');
const client = require('prom-client');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({
    app: 'node-application-monitoring-app',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

// MySQL connection using environment variables
const mysqlConnection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test MySQL connection
(async () => {
    try {
        const [rows] = await mysqlConnection.query('SELECT DATABASE()');
        console.log('Connected to MySQL! Current database:', rows[0]['DATABASE()']);
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
})();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));
app.use(helmet()); // Secure headers
app.use(morgan('combined')); // Logging

// Disable x-powered-by header
app.disable('x-powered-by');

// Get logs with pagination
app.get('/logs', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [logs] = await mysqlConnection.query(
            'SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // Count the total number of logs
        const [totalLogsResult] = await mysqlConnection.query('SELECT COUNT(*) AS totalLogs FROM logs');
        const totalLogs = totalLogsResult[0].totalLogs;

        // Send response
        res.json({ logs, totalLogs });
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Error fetching logs.' });
    }
});

// Register a new user
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) return res.status(400).send('Missing required fields.');

    try {
        const [rows] = await mysqlConnection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).send('User already registered.');

        const hashedPassword = await bcrypt.hash(password, 10);
        await mysqlConnection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);

        // Log the operation
        try {
            await mysqlConnection.query('INSERT INTO logs (operation, table_name, data, timestamp) VALUES (?, ?, ?, NOW())', ['INSERT', 'users', JSON.stringify({ name, email, role })]);
        } catch (logErr) {
            console.error('Error logging operation:', logErr);
        }

        res.send({ name, email, role });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user.');
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await mysqlConnection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).send('Invalid email or password.');

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        res.send({ message: 'Login successful' });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in.');
    }
});

// Get user by ID
app.get('/user/:id', async (req, res) => {
    try {
        const [rows] = await mysqlConnection.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('User not found.');

        res.send(rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Error fetching user.');
    }
});

// Update user
app.put('/user/:id', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    try {
        const [result] = await mysqlConnection.query('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?', [name, email, hashedPassword, role, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).send('User not found.');

        // Log the operation
        try {
            await mysqlConnection.query('INSERT INTO logs (operation, table_name, data, timestamp) VALUES (?, ?, ?, NOW())', ['UPDATE', 'users', JSON.stringify({ id: req.params.id, name, email, role })]);
        } catch (logErr) {
            console.error('Error logging operation:', logErr);
        }

        res.send({ id: req.params.id, name, email, role });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Error updating user.');
    }
});

// Delete user
app.delete('/user/:id', async (req, res) => {
    try {
        const [result] = await mysqlConnection.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).send('User not found.');

        // Log the operation
        try {
            await mysqlConnection.query('INSERT INTO logs (operation, table_name, data, timestamp) VALUES (?, ?, ?, NOW())', ['DELETE', 'users', JSON.stringify({ id: req.params.id })]);
        } catch (logErr) {
            console.error('Error logging operation:', logErr);
        }

        res.send({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user.');
    }
});

// Get list of databases and tables
app.get('/databases', async (req, res) => {
    try {
        const [databases] = await mysqlConnection.query('SHOW DATABASES');
        const dbDetails = {};

        for (const db of databases) {
            const dbName = db.Database;
            const [tables] = await mysqlConnection.query(`SHOW TABLES IN ${dbName}`);
            dbDetails[dbName] = tables.map(table => Object.values(table)[0]);
        }

        res.send(dbDetails);
    } catch (err) {
        console.error('Error fetching database details:', err.message);
        res.status(500).send(`Error fetching database details: ${err.message}`);
    }
});

// Get table data
app.get('/table/:dbName/:tableName', async (req, res) => {
    const { dbName, tableName } = req.params;
    try {
        const [rows] = await mysqlConnection.query(`SELECT * FROM ${dbName}.${tableName}`);
        res.send(rows);
    } catch (err) {
        console.error('Error fetching table data:', err);
        res.status(500).send('Error fetching table data.');
    }
});

// Insert new row into table
app.post('/table/:dbName/:tableName', async (req, res) => {
    const { dbName, tableName } = req.params;
    const data = req.body;
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');

    try {
        const [result] = await mysqlConnection.query(`INSERT INTO ${dbName}.${tableName} (${columns}) VALUES (${placeholders})`, values);

        // Log the operation
        try {
            await mysqlConnection.query('INSERT INTO logs (operation, table_name, data, timestamp) VALUES (?, ?, ?, NOW())', ['INSERT', `${dbName}.${tableName}`, JSON.stringify(data)]);
        } catch (logErr) {
            console.error('Error logging operation:', logErr);
        }

        res.send({ id: result.insertId });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error inserting data.');
    }
});

// Update existing row in table
app.put('/table/:dbName/:tableName/:id', async (req, res) => {
    const { dbName, tableName, id } = req.params;
    const data = req.body;
    const updates = Object.entries(data).map(([key, value]) => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    try {
        const [result] = await mysqlConnection.query(`UPDATE ${dbName}.${tableName} SET ${updates} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).send('Row not found.');

        // Log the operation
        try {
            await mysqlConnection.query('INSERT INTO logs (operation, table_name, data, timestamp) VALUES (?, ?, ?, NOW())', ['UPDATE', `${dbName}.${tableName}`, JSON.stringify(data)]);
        } catch (logErr) {
            console.error('Error logging operation:', logErr);
        }

        res.send({ message: 'Row updated successfully' });
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).send('Error updating data.');
    }
});

// Delete row from table
app.delete('/table/:dbName/:tableName/:id', async (req, res) => {
    const { dbName, tableName, id } = req.params;

    try {
        const [result] = await mysqlConnection.query(`DELETE FROM ${dbName}.${tableName} WHERE id = ?`, [id]);
        if (result.affectedRows === 0) return res.status(404).send('Row not found.');

        // Log the operation
        try {
            await mysqlConnection.query('INSERT INTO logs (operation, table_name, data, timestamp) VALUES (?, ?, ?, NOW())', ['DELETE', `${dbName}.${tableName}`, JSON.stringify({ id })]);
        } catch (logErr) {
            console.error('Error logging operation:', logErr);
        }

        res.send({ message: 'Row deleted successfully' });
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).send('Error deleting data.');
    }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Internal server error');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
