const db = require('../config/database');

class CategoryModel {
    // Create new category
    static async create(categoryData) {
        const { name, description, icon, color } = categoryData;

        const query = `
            INSERT INTO categories (name, description, icon, color)
            VALUES (?, ?, ?, ?)
        `;

        const result = await db.executeQuery(query, [name, description, icon || null, color || '#007bff']);
        return result.insertId;
    }

    // Get all categories
    static async getAll(includeInactive = false) {
        let query = 'SELECT * FROM categories';
        if (!includeInactive) {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY name';
        return await db.executeQuery(query);
    }

    // Get category by ID
    static async findById(id) {
        const query = 'SELECT * FROM categories WHERE id = ?';
        const categories = await db.executeQuery(query, [id]);
        return categories[0];
    }

    // Update category
    static async update(id, categoryData) {
        const allowedFields = ['name', 'description', 'icon', 'color', 'is_active'];
        const updates = [];
        const values = [];

        Object.keys(categoryData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(categoryData[key]);
            }
        });

        if (updates.length === 0) return false;

        values.push(id);
        const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
        await db.executeQuery(query, values);
        return true;
    }

    // Delete category
    static async delete(id) {
        const query = 'DELETE FROM categories WHERE id = ?';
        await db.executeQuery(query, [id]);
        return true;
    }

    // Get category statistics
    static async getStats() {
        const query = `
            SELECT 
                c.*,
                COUNT(i.id) as issue_count,
                SUM(CASE WHEN i.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
            FROM categories c
            LEFT JOIN issues i ON c.id = i.category_id
            GROUP BY c.id
            ORDER BY issue_count DESC
        `;
        return await db.executeQuery(query);
    }
}

module.exports = CategoryModel;