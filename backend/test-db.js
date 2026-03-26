const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing database connection...');
    console.log('📊 Connection details:', {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'civic_issues_db',
        password: process.env.DB_PASSWORD ? '******' : '(empty)'
    });

    try {
        // Try to connect
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'civic_issues_db'
        });

        console.log('✅ SUCCESS: Connected to MySQL database!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT NOW() AS `current_time`');
        console.log('🕒 Server time:', rows[0].current_time);
        
        // Check if tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Tables in database:', tables.length);
        if (tables.length > 0) {
            tables.forEach(table => {
                console.log('   -', Object.values(table)[0]);
            });
        } else {
            console.log('   No tables found. You need to run the schema.');
        }
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.error('❌ FAILED: Database connection error');
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n🔧 FIX: Access denied. Check your username and password in .env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n🔧 FIX: Database does not exist. Create it first:');
            console.error('   mysql -u root -p -e "CREATE DATABASE civic_issues_db;"');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n🔧 FIX: MySQL server is not running. Start MySQL service:');
            console.error('   net start MySQL');
        }
        
        return false;
    }
}

testConnection();