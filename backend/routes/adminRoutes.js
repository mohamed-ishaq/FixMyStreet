const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadSingleWithField } = require('../middleware/uploadMiddleware');

// Apply auth middleware to all admin routes
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', [
    body('full_name').optional().notEmpty(),
    body('role').optional().isIn(['admin', 'people'])
], updateUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Issue management
router.get('/issues', getAllIssues);
router.put(
    '/issues/:id/status',
    uploadSingleWithField('resolved_image'),
    [
        body('status').isIn(['pending', 'in_progress', 'resolved', 'rejected']),
        body('update_text').notEmpty().withMessage('Update message is required')
    ],
    updateIssueStatus
);

// Category management
router.post('/categories', [
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').optional()
], createCategory);
router.put('/categories/:id', [
    body('name').optional().notEmpty(),
    body('description').optional(),
    body('is_active').optional().isBoolean()
], updateCategory);
router.delete('/categories/:id', deleteCategory);

// System
router.get('/logs', getSystemLogs);

module.exports = router;
