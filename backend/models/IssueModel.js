const db = require('../config/database');

class IssueModel {
    // Create new issue
    static async create(issueData) {
        const {
            user_id, category_id, title, description, address, location,
            phone, pin_code, image_url, priority = 'medium'
        } = issueData;

        const query = `
            INSERT INTO issues 
            (user_id, category_id, title, description, address, location, phone, pin_code, image_url, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.executeQuery(query, [
            user_id, category_id, title, description, address, location,
            phone || null, pin_code || null, image_url || null, priority
        ]);

        return result.insertId;
    }

    // Get issue by ID with details
    static async findById(id) {
        const query = `
            SELECT 
                i.*,
                u.full_name as reporter_name,
                u.email as reporter_email,
                u.phone as reporter_phone,
                c.name as category_name,
                c.color as category_color,
                (SELECT COUNT(*) FROM comments WHERE issue_id = i.id) as comment_count,
                (SELECT COUNT(*) FROM issue_updates WHERE issue_id = i.id) as update_count
            FROM issues i
            JOIN users u ON i.user_id = u.id
            JOIN categories c ON i.category_id = c.id
            WHERE i.id = ?
        `;
        
        const issues = await db.executeQuery(query, [id]);
        return issues[0];
    }

    // Get all issues with filters
    static async getAll(filters = {}, pagination = {}) {
        let query = `
            SELECT 
                i.*,
                u.full_name as reporter_name,
                c.name as category_name,
                c.color as category_color,
                (SELECT COUNT(*) FROM comments WHERE issue_id = i.id) as comment_count
            FROM issues i
            JOIN users u ON i.user_id = u.id
            JOIN categories c ON i.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Apply filters
        if (filters.status) {
            query += ' AND i.status = ?';
            params.push(filters.status);
        }

        if (filters.category_id) {
            query += ' AND i.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.priority) {
            query += ' AND i.priority = ?';
            params.push(filters.priority);
        }

        if (filters.user_id) {
            query += ' AND i.user_id = ?';
            params.push(filters.user_id);
        }

        if (filters.search) {
            query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters.from_date) {
            query += ' AND DATE(i.created_at) >= ?';
            params.push(filters.from_date);
        }

        if (filters.to_date) {
            query += ' AND DATE(i.created_at) <= ?';
            params.push(filters.to_date);
        }

        if (filters.near_lat && filters.near_lng && filters.radius) {
            // Haversine formula for nearby locations
            query += ` AND (
                6371 * acos(
                    cos(radians(?)) * cos(radians(i.latitude)) * 
                    cos(radians(i.longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(i.latitude))
                )
            ) <= ?`;
            params.push(filters.near_lat, filters.near_lng, filters.near_lat, filters.radius);
        }

        // Get total count for pagination
        const countQuery = query.replace(
            'i.*, u.full_name as reporter_name, c.name as category_name, c.color as category_color, (SELECT COUNT(*) FROM comments WHERE issue_id = i.id) as comment_count',
            'COUNT(*) as total'
        );
        const countResult = await db.executeQuery(countQuery, params);
        const total = countResult[0].total;

        // Apply sorting
        const sortField = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order || 'DESC';
        query += ` ORDER BY i.${sortField} ${sortOrder}`;

        // Apply pagination
        if (pagination.limit) {
            query += ' LIMIT ? OFFSET ?';
            params.push(parseInt(pagination.limit), parseInt(pagination.offset || 0));
        }

        const issues = await db.executeQuery(query, params);
        return { issues, total };
    }

    // Update issue status
    static async updateStatus(id, status, admin_id, update_text, resolved_image_url = null) {
        if (status === 'resolved') {
            await db.executeQuery(
                `UPDATE issues
                 SET status = ?, resolved_at = NOW(), resolved_image_url = COALESCE(?, resolved_image_url)
                 WHERE id = ?`,
                [status, resolved_image_url, id]
            );
        } else {
            await db.executeQuery(
                `UPDATE issues
                 SET status = ?, resolved_at = NULL, resolved_image_url = NULL
                 WHERE id = ?`,
                [status, id]
            );
        }

        await db.executeQuery(
            'INSERT INTO issue_updates (issue_id, admin_id, status, update_text) VALUES (?, ?, ?, ?)',
            [id, admin_id, status, update_text]
        );

        return true;
    }

    // Update issue
    static async update(id, issueData) {
        const allowedFields = ['title', 'description', 'category_id', 'priority', 'address', 'location', 'phone', 'pin_code'];
        const updates = [];
        const values = [];

        Object.keys(issueData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(issueData[key]);
            }
        });

        if (updates.length === 0) return false;

        values.push(id);
        const query = `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`;
        await db.executeQuery(query, values);
        return true;
    }

    // Delete issue
    static async delete(id) {
        const query = 'DELETE FROM issues WHERE id = ?';
        await db.executeQuery(query, [id]);
        return true;
    }

    // Get issue statistics
    static async getStats() {
        const queries = {
            total: 'SELECT COUNT(*) as total FROM issues',
            byStatus: 'SELECT status, COUNT(*) as count FROM issues GROUP BY status',
            byPriority: 'SELECT priority, COUNT(*) as count FROM issues GROUP BY priority',
            byCategory: `
                SELECT c.name, COUNT(i.id) as count 
                FROM categories c 
                LEFT JOIN issues i ON c.id = i.category_id 
                GROUP BY c.id, c.name
            `,
            recent: `
                SELECT i.*, u.full_name as reporter_name, c.name as category_name
                FROM issues i
                JOIN users u ON i.user_id = u.id
                JOIN categories c ON i.category_id = c.id
                ORDER BY i.created_at DESC
                LIMIT 5
            `,
            monthly: `
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
                FROM issues
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY month
                ORDER BY month DESC
            `
        };

        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            results[key] = await db.executeQuery(query);
        }

        return results;
    }

    // Increment view count
    static async incrementViews(id) {
        const query = 'UPDATE issues SET views = views + 1 WHERE id = ?';
        await db.executeQuery(query, [id]);
        return true;
    }
}

module.exports = IssueModel;
