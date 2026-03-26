const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDemoUsers() {
    console.log('🔧 Seeding demo users...');
    
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'civic_issues_db'
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const userPassword = await bcrypt.hash('user123', salt);
        const adminPassword = await bcrypt.hash('admin123', salt);

        // Insert Dem User
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
            VALUES ('demouser', 'user@example.com', ?, 'Demo User', 'people')
        `, [userPassword]);
        console.log('✅ Demo User seeded');

        // Insert Admin User
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
            VALUES ('demoadmin', 'admin@example.com', ?, 'Admin User', 'admin')
        `, [adminPassword]);
        console.log('✅ Demo Admin seeded');
        
        console.log('\n🎉 Demo users seeded successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error('Error details:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

seedDemoUsers();
