-- Create the logs table
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation VARCHAR(10),
    table_name VARCHAR(50),
    old_data TEXT,
    new_data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example trigger for the `user` table
CREATE TRIGGER user_after_insert
AFTER INSERT ON user
FOR EACH ROW
BEGIN
    INSERT INTO logs (operation, table_name, new_data)
    VALUES ('INSERT', 'user', CONCAT('id: ', NEW.id, ', name: ', NEW.name, ', email: ', NEW.email));
END;

CREATE TRIGGER user_after_update
AFTER UPDATE ON user
FOR EACH ROW
BEGIN
    INSERT INTO logs (operation, table_name, old_data, new_data)
    VALUES ('UPDATE', 'user', CONCAT('id: ', OLD.id, ', name: ', OLD.name, ', email: ', OLD.email),
            CONCAT('id: ', NEW.id, ', name: ', NEW.name, ', email: ', NEW.email));
END;

CREATE TRIGGER user_after_delete
AFTER DELETE ON user
FOR EACH ROW
BEGIN
    INSERT INTO logs (operation, table_name, old_data)
    VALUES ('DELETE', 'user', CONCAT('id: ', OLD.id, ', name: ', OLD.name, ', email: ', OLD.email));
END;

