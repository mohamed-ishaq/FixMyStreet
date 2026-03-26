const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertCategories() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'civic_issues_db'
        });
        
        console.log('✅ Connected to database');

        const categories = [
            ['Road Damage', 'Potholes, damaged roads, street issues', 'road', '#dc3545'],
            ['Street Lighting', 'Broken or malfunctioning street lights', 'lightbulb', '#ffc107'],
            ['Garbage & Waste', 'Waste management, garbage collection issues', 'trash', '#28a745'],
            ['Water Supply', 'Water leakage, contamination, supply issues', 'water', '#17a2b8'],
            ['Sewage & Drainage', 'Blocked drains, sewage problems', 'pipe', '#6f42c1'],
            ['Public Safety', 'Security concerns, hazards', 'shield', '#fd7e14'],
            ['Parks & Recreation', 'Park maintenance, playground issues', 'tree', '#20c997'],
            ['Public Transport', 'Bus stops, transport issues', 'bus', '#6610f2'],
            ['Noise Pollution', 'Excessive noise complaints', 'volume-up', '#e83e8c'],
            ['Air Quality', 'Air pollution concerns', 'wind', '#6c757d']
        ];

        for (const cat of categories) {
            await connection.execute(
                'INSERT IGNORE INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)',
                cat
            );
        }

        console.log('✅ Categories inserted successfully');

        // Verify insertion
        const [rows] = await connection.execute('SELECT * FROM categories');
        console.log(`\n📊 Total categories: ${rows.length}`);
        rows.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.color})`);
        });

    } catch (error) {
        console.error('❌ Failed to insert categories:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

insertCategories();