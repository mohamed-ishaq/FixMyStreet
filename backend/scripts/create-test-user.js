const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
    console.log('👤 Creating test users...');
    
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'civic_issues_db'
        });
        
        console.log('✅ Connected to database');
        
        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const userPassword = await bcrypt.hash('user123', salt);
        
        // Insert admin user
        const [adminResult] = await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
            VALUES (?, ?, ?, ?, ?)
        `, ['admin', 'admin@example.com', adminPassword, 'System Administrator', 'admin']);
        
        if (adminResult.affectedRows > 0) {
            console.log('✅ Admin user created - Email: admin@example.com, Password: admin123');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
        
        // Insert regular user
        const [userResult] = await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
            VALUES (?, ?, ?, ?, ?)
        `, ['john_doe', 'user@example.com', userPassword, 'John Doe', 'people']);
        
        if (userResult.affectedRows > 0) {
            console.log('✅ Regular user created - Email: user@example.com, Password: user123');
        } else {
            console.log('ℹ️ Regular user already exists');
        }
        
        // Show existing users
        const [users] = await connection.execute(`
            SELECT id, username, email, full_name, role, is_active 
            FROM users 
            WHERE email IN ('admin@example.com', 'user@example.com')
        `);
        
        console.log('\n📋 Test users in database:');
        users.forEach(user => {
            console.log(`   - ${user.email} (${user.role}): ${user.full_name}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to create test users:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTestUser();
