const UserModel = require('../models/UserModel');
const IssueModel = require('../models/IssueModel');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get user's issue statistics
    const issues = await IssueModel.getAll({ user_id: req.user.id });
    
    const stats = {
        total_issues: issues.total,
        pending: issues.issues.filter(i => i.status === 'pending').length,
        in_progress: issues.issues.filter(i => i.status === 'in_progress').length,
        resolved: issues.issues.filter(i => i.status === 'resolved').length,
        rejected: issues.issues.filter(i => i.status === 'rejected').length
    };

    res.json({
        success: true,
        user,
        stats
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { full_name, phone, address } = req.body;

    const updated = await UserModel.update(req.user.id, {
        full_name,
        phone,
        address
    });

    if (!updated) {
        res.status(400);
        throw new Error('Failed to update profile');
    }

    const user = await UserModel.findById(req.user.id);

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user
    });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;

    // Get user with password
    const user = await UserModel.findByEmail(req.user.email);
    
    // Verify current password
    const isPasswordValid = await UserModel.verifyPassword(current_password, user.password);
    
    if (!isPasswordValid) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Update password
    await UserModel.updatePassword(req.user.id, new_password);

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Get user's issues
// @route   GET /api/users/issues
// @access  Private
const getUserIssues = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { issues, total } = await IssueModel.getAll(
        { user_id: req.user.id },
        { limit, offset }
    );

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

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
    await UserModel.delete(req.user.id);
    
    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getUserIssues,
    deleteAccount
};