const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
    console.log('========================================');
    console.log('FIXING DATABASE SCHEMA');
    console.log('========================================');

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'civic_issues_db'
        });

        console.log('Connected to database');

        console.log('\nCurrent users table structure:');
        const [columns] = await connection.execute('DESCRIBE users');
        columns.forEach((col) => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });

        console.log('\nAdding missing columns...');

        try {
            await connection.execute('ALTER TABLE users ADD COLUMN profile_image VARCHAR(500) AFTER address');
            console.log('Added profile_image column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('profile_image column already exists');
            } else {
                console.log('Could not add profile_image:', err.message);
            }
        }

        try {
            await connection.execute('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true AFTER role');
            console.log('Added is_active column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('is_active column already exists');
            } else {
                console.log('Could not add is_active:', err.message);
            }
        }

        try {
            await connection.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER updated_at');
            console.log('Added last_login column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('last_login column already exists');
            } else {
                console.log('Could not add last_login:', err.message);
            }
        }

        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN resolved_image_url VARCHAR(500) AFTER image_url');
            console.log('Added resolved_image_url column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('resolved_image_url column already exists');
            } else {
                console.log('Could not add resolved_image_url:', err.message);
            }
        }

        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN address TEXT AFTER description');
            console.log('Added address column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('address column already exists');
            } else {
                console.log('Could not add address column:', err.message);
            }
        }

        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN phone VARCHAR(20) AFTER location');
            console.log('Added phone column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('phone column already exists');
            } else {
                console.log('Could not add phone column:', err.message);
            }
        }

        try {
            await connection.execute('ALTER TABLE issues ADD COLUMN pin_code VARCHAR(10) AFTER phone');
            console.log('Added pin_code column to issues');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('pin_code column already exists');
            } else {
                console.log('Could not add pin_code column:', err.message);
            }
        }

        await connection.execute('UPDATE users SET is_active = 1 WHERE is_active IS NULL');
        console.log('Updated existing users to be active');

        console.log('\nUpdated users table structure:');
        const [updatedColumns] = await connection.execute('DESCRIBE users');
        updatedColumns.forEach((col) => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });

        console.log('\nDatabase fix completed');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixDatabase();
