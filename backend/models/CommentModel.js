const db = require('../config/database');

class CommentModel {
    // Create new comment
    static async create(commentData) {
        const { issue_id, user_id, comment } = commentData;

        const query = `
            INSERT INTO comments (issue_id, user_id, comment)
            VALUES (?, ?, ?)
        `;

        const result = await db.executeQuery(query, [issue_id, user_id, comment]);
        return result.insertId;
    }

    // Get comments for an issue
    static async getByIssueId(issueId) {
        const query = `
            SELECT 
                c.*,
                u.full_name as user_name,
                u.role as user_role,
                u.profile_image
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.issue_id = ?
            ORDER BY c.created_at DESC
        `;
        return await db.executeQuery(query, [issueId]);
    }

    // Get comment by ID
    static async findById(id) {
        const query = 'SELECT * FROM comments WHERE id = ?';
        const comments = await db.executeQuery(query, [id]);
        return comments[0];
    }

    // Update comment
    static async update(id, comment, userId) {
        // Verify ownership
        const comment_data = await this.findById(id);
        if (!comment_data || comment_data.user_id !== userId) {
            return false;
        }

        const query = 'UPDATE comments SET comment = ? WHERE id = ?';
        await db.executeQuery(query, [comment, id]);
        return true;
    }

    // Delete comment
    static async delete(id, userId, isAdmin = false) {
        let query;
        if (isAdmin) {
            query = 'DELETE FROM comments WHERE id = ?';
            await db.executeQuery(query, [id]);
        } else {
            // Verify ownership
            const comment = await this.findById(id);
            if (!comment || comment.user_id !== userId) {
                return false;
            }
            query = 'DELETE FROM comments WHERE id = ?';
            await db.executeQuery(query, [id]);
        }
        return true;
    }

    // Get comment count for an issue
    static async getCountByIssueId(issueId) {
        const query = 'SELECT COUNT(*) as count FROM comments WHERE issue_id = ?';
        const result = await db.executeQuery(query, [issueId]);
        return result[0].count;
    }

    // Get recent comments
    static async getRecent(limit = 10) {
        const query = `
            SELECT 
                c.*,
                u.full_name as user_name,
                i.title as issue_title,
                i.id as issue_id
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN issues i ON c.issue_id = i.id
            ORDER BY c.created_at DESC
            LIMIT ?
        `;
        return await db.executeQuery(query, [limit]);
    }
}

module.exports = CommentModel;