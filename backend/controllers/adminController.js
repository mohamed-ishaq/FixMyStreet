const UserModel = require('../models/UserModel');
const IssueModel = require('../models/IssueModel');
const CategoryModel = require('../models/CategoryModel');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const userStats = await UserModel.getStats();
    const issueStats = await IssueModel.getStats();
    const categoryStats = await CategoryModel.getStats();

    res.json({
        success: true,
        stats: {
            users: userStats,
            issues: issueStats,
            categories: categoryStats
        }
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const { role, search, limit } = req.query;
    
    const users = await UserModel.getAll({ role, search, limit });
    
    res.json({
        success: true,
        users
    });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get user's issues
    const { issues } = await IssueModel.getAll({ user_id: req.params.id });

    res.json({
        success: true,
        user: {
            ...user,
            issues
        }
    });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const { full_name, phone, address, role } = req.body;

    const user = await UserModel.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await UserModel.update(req.params.id, {
        full_name,
        phone,
        address,
        role
    });

    const updatedUser = await UserModel.findById(req.params.id);

    res.json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
    });
});

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await UserModel.toggleStatus(req.params.id);

    res.json({
        success: true,
        message: `User ${user.is_active ? 'deactivated' : 'activated'} successfully`
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await UserModel.delete(req.params.id);

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

// @desc    Update issue status
// @route   PUT /api/admin/issues/:id/status
// @access  Private/Admin
const updateIssueStatus = asyncHandler(async (req, res) => {
    const { status, update_text } = req.body;
    const allowedStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];

    if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
    }

    if (!update_text || !update_text.trim()) {
        res.status(400);
        throw new Error('Update message is required');
    }

    const issue = await IssueModel.findById(req.params.id);
    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    const resolvedImageUrl = req.file ? `/uploads/issues/${req.file.filename}` : null;
    if (status === 'resolved' && !resolvedImageUrl && !issue.resolved_image_url) {
        res.status(400);
        throw new Error('A solved proof image is required when marking an issue as resolved');
    }

    await IssueModel.updateStatus(
        req.params.id,
        status,
        req.user.id,
        update_text.trim(),
        resolvedImageUrl
    );

    const updatedIssue = await IssueModel.findById(req.params.id);

    res.json({
        success: true,
        message: 'Issue status updated successfully',
        issue: updatedIssue
    });
});

// @desc    Get all issues (admin view)
// @route   GET /api/admin/issues
// @access  Private/Admin
const getAllIssues = asyncHandler(async (req, res) => {
    const {
        status, category, priority, search,
        from_date, to_date,
        user_id,
        page = 1, limit = 20
    } = req.query;

    const filters = {
        status,
        category_id: category,
        priority,
        search,
        from_date,
        to_date,
        user_id
    };

    const offset = (page - 1) * limit;
    const { issues, total } = await IssueModel.getAll(filters, { limit, offset });

    res.json({
        success: true,
        issues,
        pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(total / limit),
            total_items: total,
            items_per_page: parseInt(limit)
        }
    });
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, color } = req.body;

    const categoryId = await CategoryModel.create({
        name,
        description,
        icon,
        color
    });

    const category = await CategoryModel.findById(categoryId);

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
    });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, color, is_active } = req.body;

    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    await CategoryModel.update(req.params.id, {
        name,
        description,
        icon,
        color,
        is_active
    });

    const updatedCategory = await CategoryModel.findById(req.params.id);

    res.json({
        success: true,
        message: 'Category updated successfully',
        category: updatedCategory
    });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await CategoryModel.findById(req.params.id);
    
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    await CategoryModel.delete(req.params.id);

    res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});

// @desc    Get system logs (placeholder)
// @route   GET /api/admin/logs
// @access  Private/Admin
const getSystemLogs = asyncHandler(async (req, res) => {
    // This would integrate with a logging system
    res.json({
        success: true,
        message: 'Logs feature coming soon'
    });
});

module.exports = {
    getDashboardStats,
    getUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    updateIssueStatus,
    getAllIssues,
    createCategory,
    updateCategory,
    deleteCategory,
    getSystemLogs
};
