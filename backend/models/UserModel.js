const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    // Create new user
    static async create(userData) {
        const { username, email, password, full_name, phone, address, role = 'people' } = userData;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const query = `
            INSERT INTO users (username, email, password_hash, full_name, phone, address, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await db.executeQuery(query, [
            username, email, hashedPassword, full_name, phone, address, role
        ]);
        
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const users = await db.executeQuery(query, [email]);
        return users[0];
    }

    // Find user by username
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = ?';
        const users = await db.executeQuery(query, [username]);
        return users[0];
    }

    // Find user by ID - REMOVE profile_image if column doesn't exist
    static async findById(id) {
        const query = `
            SELECT id, username, email, full_name, phone, address, role, 
                   is_active, created_at, updated_at
            FROM users 
            WHERE id = ?
        `;
        const users = await db.executeQuery(query, [id]);
        return users[0];
    }

    // Get all users (admin only)
    static async getAll(filters = {}) {
        let query = `
            SELECT id, username, email, full_name, phone, address, role, 
                   is_active, created_at 
            FROM users
            WHERE 1=1
        `;
        const params = [];

        if (filters.role) {
            query += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.search) {
            query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        return await db.executeQuery(query, params);
    }

    // Update user - REMOVE profile_image if column doesn't exist
    static async update(id, userData) {
        const allowedFields = ['full_name', 'phone', 'address'];
        const updates = [];
        const values = [];

        Object.keys(userData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(userData[key]);
            }
        });

        if (updates.length === 0) return false;

        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db.executeQuery(query, values);
        return true;
    }

    // Update password
    static async updatePassword(id, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
        await db.executeQuery(query, [hashedPassword, id]);
        return true;
    }

    // Delete user
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        await db.executeQuery(query, [id]);
        return true;
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Toggle user active status
    static async toggleStatus(id) {
        const query = 'UPDATE users SET is_active = NOT is_active WHERE id = ?';
        await db.executeQuery(query, [id]);
        return true;
    }

    // Get user statistics
    static async getStats() {
        const query = `
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'people' THEN 1 ELSE 0 END) as people_count,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
                DATE_FORMAT(created_at, '%Y-%m') as month
            FROM users
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        `;
        return await db.executeQuery(query);
    }
}

module.exports = UserModel;