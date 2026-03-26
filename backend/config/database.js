const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'civic_issues_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const ensureIssueColumns = async (connection) => {
    const columnsToEnsure = [
        { name: 'address', definition: 'TEXT AFTER description' },
        { name: 'phone', definition: 'VARCHAR(20) AFTER location' },
        { name: 'pin_code', definition: 'VARCHAR(10) AFTER phone' }
    ];

    for (const column of columnsToEnsure) {
        try {
            await connection.execute(`ALTER TABLE issues ADD COLUMN ${column.name} ${column.definition}`);
            console.log(`Added missing issues.${column.name} column`);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                throw error;
            }
        }
    }
};

// Test database connection
const testConnection = async () => {
    let connection;

    try {
        connection = await pool.getConnection();
        console.log('Database connected successfully');

        await ensureIssueColumns(connection);

        // Check if categories table has data
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        console.log(`Categories in database: ${rows[0].count}`);

        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error.message);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    pool,
    executeQuery,
    testConnection
};
