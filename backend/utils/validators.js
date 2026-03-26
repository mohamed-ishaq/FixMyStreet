const { body, validationResult } = require('express-validator');

// Common validation rules
const validators = {
    // Email validation
    email: body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    // Password validation
    password: body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Password must contain at least one letter and one number'),

    // Username validation
    username: body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),

    // Full name validation
    fullName: body('full_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain letters and spaces'),

    // Phone validation
    phone: body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    // Address validation
    address: body('address')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),

    // Title validation
    title: body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),

    // Description validation
    description: body('description')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Description must be between 10 and 5000 characters'),

    // Location validation
    location: body('location')
        .isLength({ min: 3, max: 500 })
        .withMessage('Location must be between 3 and 500 characters'),

    // Category ID validation
    categoryId: body('category_id')
        .isInt({ min: 1 })
        .withMessage('Please select a valid category'),

    // Priority validation
    priority: body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority level'),

    // Status validation
    status: body('status')
        .isIn(['pending', 'in_progress', 'resolved', 'rejected'])
        .withMessage('Invalid status'),

    // Comment validation
    comment: body('comment')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),

    // Role validation
    role: body('role')
        .optional()
        .isIn(['admin', 'people'])
        .withMessage('Invalid role'),

    // Latitude validation
    latitude: body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    // Longitude validation
    longitude: body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),

    // ID validation
    id: body('id')
        .isInt({ min: 1 })
        .withMessage('Invalid ID'),

    // Date validation
    date: body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
};

// Validation result checker
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Custom validators
const customValidators = {
    // Check if value is a number
    isNumber: (value) => {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    // Check if value is a positive integer
    isPositiveInteger: (value) => {
        const num = parseInt(value);
        return Number.isInteger(num) && num > 0;
    },

    // Validate password strength
    isStrongPassword: (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasNonalphas = /\W/.test(password);
        return hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas && password.length >= 8;
    },

    // Validate file type
    isValidFileType: (filename, allowedTypes) => {
        const ext = filename.split('.').pop().toLowerCase();
        return allowedTypes.includes(ext);
    },

    // Validate file size
    isValidFileSize: (size, maxSize) => {
        return size <= maxSize;
    },

    // Validate coordinates
    isValidCoordinates: (lat, lng) => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
};

module.exports = {
    validators,
    validate,
    customValidators
};