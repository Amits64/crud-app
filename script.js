document.addEventListener('DOMContentLoaded', () => {
    const tableNameSpan = document.getElementById('table-name');
    const tableSection = document.getElementById('table-section');
    const tableDataDiv = document.getElementById('table-data');
    const tableHeaders = document.getElementById('table-headers');
    const tableBody = document.getElementById('table-body');
    const paginationControls = document.getElementById('pagination-controls');

    let currentTable = '';

    // Function to fetch and display table data
    async function fetchTableData(dbName, tableName) {
        try {
            const response = await fetch(`/table/${dbName}/${tableName}`);
            if (!response.ok) throw new Error('Failed to fetch table data.');

            const data = await response.json();
            currentTable = { dbName, tableName };
            displayTableData(data);
        } catch (error) {
            showError(error.message);
        }
    }

    // Function to display table data
    function displayTableData(data) {
        tableBody.innerHTML = '';
        tableHeaders.innerHTML = '';

        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tableHeaders.appendChild(th);
            });

            data.forEach(row => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = row[header];
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
        }
    }

    // Error handling
    function showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        setTimeout(() => errorDiv.textContent = '', 5000);
    }

    // Insert row
    async function insertRow(event) {
        event.preventDefault();
        const data = JSON.parse(document.getElementById('new-row-data').value);
        try {
            const response = await fetch(`/table/${currentTable.dbName}/${currentTable.tableName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to insert data.');

            const result = await response.json();
            showNotification(`Inserted row with ID ${result.id}`);
            fetchTableData(currentTable.dbName, currentTable.tableName);
        } catch (error) {
            showError(error.message);
        }
    }

    // Update row
    async function updateRow(event) {
        event.preventDefault();
        const id = document.getElementById('update-id').value;
        const data = JSON.parse(document.getElementById('update-row-data').value);
        try {
            const response = await fetch(`/table/${currentTable.dbName}/${currentTable.tableName}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update data.');

            showNotification(`Updated row with ID ${id}`);
            fetchTableData(currentTable.dbName, currentTable.tableName);
        } catch (error) {
            showError(error.message);
        }
    }

    // Delete row
    async function deleteRow(event) {
        event.preventDefault();
        const id = document.getElementById('delete-id').value;
        try {
            const response = await fetch(`/table/${currentTable.dbName}/${currentTable.tableName}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete data.');

            showNotification(`Deleted row with ID ${id}`);
            fetchTableData(currentTable.dbName, currentTable.tableName);
        } catch (error) {
            showError(error.message);
        }
    }

    // Notification handling
    function showNotification(message) {
        const notificationModal = document.getElementById('notification-modal');
        const notificationMessage = document.getElementById('notification-message');
        notificationMessage.textContent = message;
        notificationModal.classList.remove('hidden');
        setTimeout(() => notificationModal.classList.add('hidden'), 5000);
    }

    window.closeNotification = () => document.getElementById('notification-modal').classList.add('hidden');
    window.closeModal = () => document.getElementById('confirmation-modal').classList.add('hidden');
    window.confirmAction = () => {
        // Confirmation action logic here
        closeModal();
    }

    // Example fetch on page load
    fetchTableData('exampleDB', 'exampleTable'); // Replace with actual DB and table names
});
