const db = require('../config/database');
const asyncHandler = require('express-async-handler');
const IssueModel = require('../models/IssueModel');
const CommentModel = require('../models/CommentModel');

// @desc    Get all categories
// @route   GET /api/issues/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const query = 'SELECT id, name, description, icon, color FROM categories WHERE is_active = 1 ORDER BY name';
    const categories = await db.executeQuery(query);

    res.json({
        success: true,
        categories,
        count: categories.length
    });
});

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    const { category_id, title, description, address, location, phone, pin_code, priority } = req.body;

    if (!category_id || !title?.trim() || !description?.trim() || !address?.trim() || !location?.trim() || !phone?.trim() || !pin_code?.trim()) {
        res.status(400);
        throw new Error('Category, title, description, address, nearby place, phone number, and pin code are required');
    }

    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
        res.status(400);
        throw new Error('Please provide a valid phone number');
    }

    if (!/^[0-9]{6}$/.test(pin_code.trim())) {
        res.status(400);
        throw new Error('Please provide a valid 6-digit pin code');
    }

    const imageUrl = req.file ? `/uploads/issues/${req.file.filename}` : null;

    const insertQuery = `
        INSERT INTO issues
        (user_id, category_id, title, description, address, location, phone, pin_code, priority, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const result = await db.executeQuery(insertQuery, [
        req.user.id,
        category_id,
        title.trim(),
        description.trim(),
        address.trim(),
        location.trim(),
        phone.trim(),
        pin_code.trim(),
        priority || 'medium',
        imageUrl
    ]);

    const issueId = result.insertId;

    const issues = await db.executeQuery(
        `SELECT i.*, u.full_name as reporter_name, c.name as category_name, c.color as category_color
         FROM issues i
         JOIN users u ON i.user_id = u.id
         JOIN categories c ON i.category_id = c.id
         WHERE i.id = ?`,
        [issueId]
    );

    res.status(201).json({
        success: true,
        message: 'Issue reported successfully',
        data: issues[0]
    });
});

// @desc    Get all issues with pagination/filtering
// @route   GET /api/issues
// @access  Private
const getIssues = asyncHandler(async (req, res) => {
    const {
        status,
        category,
        priority,
        search,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'DESC'
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (currentPage - 1) * parsedLimit;
    const allowedSortFields = ['created_at', 'updated_at', 'priority', 'status'];
    const normalizedSortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const normalizedSortOrder = String(sort_order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { issues, total } = await IssueModel.getAll(
        {
            status,
            category_id: category,
            priority,
            search,
            sort_by: normalizedSortField,
            sort_order: normalizedSortOrder
        },
        { limit: parsedLimit, offset }
    );

    res.json({
        success: true,
        data: {
            issues,
            page: currentPage,
            pages: Math.ceil(total / parsedLimit) || 1,
            total
        }
    });
});

// @desc    Get current user's issues
// @route   GET /api/issues/myissues
// @access  Private
const getMyIssues = asyncHandler(async (req, res) => {
    const query = `
        SELECT
            i.*,
            c.name as category_name,
            c.color as category_color,
            (SELECT COUNT(*) FROM comments WHERE issue_id = i.id) as comment_count
        FROM issues i
        JOIN categories c ON i.category_id = c.id
        WHERE i.user_id = ?
        ORDER BY i.created_at DESC
    `;

    const issues = await db.executeQuery(query, [req.user.id]);

    res.json({
        success: true,
        data: issues
    });
});

// @desc    Get single issue details
// @route   GET /api/issues/:id
// @access  Public (optional auth)
const getIssueById = asyncHandler(async (req, res) => {
    const issue = await IssueModel.findById(req.params.id);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    const [comments, updates] = await Promise.all([
        CommentModel.getByIssueId(req.params.id),
        db.executeQuery(
            `SELECT
                iu.*,
                u.full_name as admin_name
             FROM issue_updates iu
             JOIN users u ON iu.admin_id = u.id
             WHERE iu.issue_id = ?
             ORDER BY iu.created_at DESC`,
            [req.params.id]
        )
    ]);

    res.json({
        success: true,
        data: {
            ...issue,
            comments,
            updates
        }
    });
});

// @desc    Add a comment on an issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const issue = await IssueModel.findById(req.params.id);
    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    const commentText = req.body.comment?.trim();
    if (!commentText) {
        res.status(400);
        throw new Error('Comment is required');
    }

    const commentId = await CommentModel.create({
        issue_id: req.params.id,
        user_id: req.user.id,
        comment: commentText
    });

    const [comment] = await db.executeQuery(
        `SELECT
            c.*,
            u.full_name as user_name,
            u.role as user_role
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [commentId]
    );

    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment
    });
});

module.exports = {
    getCategories,
    createIssue,
    getIssues,
    getMyIssues,
    getIssueById,
    addComment
};
