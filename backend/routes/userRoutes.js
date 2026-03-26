const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getProfile,
    updateProfile,
    changePassword,
    getUserIssues,
    deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Validation
const profileValidation = [
    body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('address').optional()
];

const passwordValidation = [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('New password must contain at least one letter and one number')
];

// Routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, profileValidation, updateProfile);
router.put('/change-password', protect, passwordValidation, changePassword);
router.get('/issues', protect, getUserIssues);
router.delete('/account', protect, deleteAccount);

module.exports = router;