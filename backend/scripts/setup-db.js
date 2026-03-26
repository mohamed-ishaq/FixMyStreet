const mysql = require('mysql2/promise');
require('dotenv').config();

async function simpleSetup() {
    console.log('🔧 Setting up database with simple method...');
    
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'civic_issues_db'}`);
        console.log(`✅ Database '${process.env.DB_NAME || 'civic_issues_db'}' ready`);
        
        // Switch to the database
        await connection.changeUser({ database: process.env.DB_NAME || 'civic_issues_db' });
        
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                role ENUM('admin', 'people') DEFAULT 'people',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL
            )
        `);
        console.log('✅ Users table created');
        
        // Create categories table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                color VARCHAR(20) DEFAULT '#007bff',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories table created');
        
        // Create issues table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS issues (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                category_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                address TEXT,
                location VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                pin_code VARCHAR(10),
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
                image_url VARCHAR(500),
                resolved_image_url VARCHAR(500),
                views INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Issues table created');
        
        // Ensure new issue contact columns exist for existing databases
        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN address TEXT AFTER description');
            console.log('✅ Added address column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('ℹ️ address column already exists in issues');
            } else {
                throw err;
            }
        }

        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN phone VARCHAR(20) AFTER location');
            console.log('✅ Added phone column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('ℹ️ phone column already exists in issues');
            } else {
                throw err;
            }
        }

        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN pin_code VARCHAR(10) AFTER phone');
            console.log('✅ Added pin_code column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('ℹ️ pin_code column already exists in issues');
            } else {
                throw err;
            }
        }

        // Create issue_updates table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS issue_updates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                issue_id INT NOT NULL,
                admin_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                update_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Issue updates table created');
        
        // Create comments table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                issue_id INT NOT NULL,
                user_id INT NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Comments table created');
        
        // Insert default categories
        await connection.execute(`
            INSERT IGNORE INTO categories (name, description, icon, color) VALUES
            ('Road Damage', 'Potholes, damaged roads, street issues', 'road', '#dc3545'),
            ('Street Lighting', 'Broken or malfunctioning street lights', 'lightbulb', '#ffc107'),
            ('Garbage & Waste', 'Waste management, garbage collection issues', 'trash', '#28a745'),
            ('Water Supply', 'Water leakage, contamination, supply issues', 'water', '#17a2b8'),
            ('Sewage & Drainage', 'Blocked drains, sewage problems', 'pipe', '#6f42c1'),
            ('Public Safety', 'Security concerns, hazards', 'shield', '#fd7e14')
        `);
        console.log('✅ Default categories inserted');
        
        console.log('\n🎉 Database setup completed successfully!');
        
        // Show tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables created:');
        for (let table of tables) {
            console.log(`   - ${Object.values(table)[0]}`);
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('Error details:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

simpleSetup();
