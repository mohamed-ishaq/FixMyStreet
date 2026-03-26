const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getCategories,
    createIssue,
    getIssues,
    getMyIssues,
    getIssueById,
    addComment
} = require('../controllers/issueController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/categories', getCategories);

// Protected routes
router.get('/', protect, getIssues);
router.get('/myissues', protect, getMyIssues);
router.get('/:id', optionalAuth, getIssueById);
router.post('/', protect, uploadSingle, [
    body('category_id').notEmpty().withMessage('Category is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('location').notEmpty().withMessage('Nearby place is required'),
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
    body('pin_code')
        .notEmpty().withMessage('Pin code is required')
        .matches(/^[0-9]{6}$/).withMessage('Please provide a valid 6-digit pin code')
], createIssue);
router.post('/:id/comments', protect, [
    body('comment').notEmpty().withMessage('Comment is required')
], addComment);

module.exports = router;
