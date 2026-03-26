const express = require('express');
const router = express.Router(); // This line was missing!
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/generateToken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register',
    [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('full_name').notEmpty().withMessage('Full name is required')
    ],
    async (req, res) => {
        console.log('📝 Registration attempt:', req.body);
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { username, email, password, full_name, phone, address, role } = req.body;

        try {
            // Check if user already exists
            const existingUsers = await db.executeQuery(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUsers.length > 0) {
                const existingUser = existingUsers[0];
                if (existingUser.email === email) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Email already registered' 
                    });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Username already taken' 
                    });
                }
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const result = await db.executeQuery(
                `INSERT INTO users (username, email, password_hash, full_name, phone, address, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, full_name, phone || null, address || null, role || 'people']
            );

            // Get the created user
            const newUser = await db.executeQuery(
                'SELECT id, username, email, full_name, phone, address, role, created_at FROM users WHERE id = ?',
                [result.insertId]
            );

            // Generate JWT token
            const token = generateToken(newUser[0].id, newUser[0].role);

            console.log('✅ User registered successfully:', newUser[0].email);

            res.status(201).json({
                success: true,
                message: 'Registration successful! Please login.',
                token,
                user: newUser[0]
            });

        } catch (error) {
            console.error('❌ Registration error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Registration failed. Please try again.' 
            });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        console.log('📝 Login attempt:', req.body.email);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        try {
            // Check if user exists
            const users = await db.executeQuery(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            const user = users[0];

            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Account is deactivated. Please contact admin.' 
                });
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Update last login
            try {
                await db.executeQuery(
                    'UPDATE users SET last_login = NOW() WHERE id = ?',
                    [user.id]
                );
            } catch (err) {
                // Ignore if last_login column doesn't exist
                console.log('Could not update last_login:', err.message);
            }

            // Generate JWT token
            const token = generateToken(user.id, user.role);

            // Remove password from response
            delete user.password_hash;

            console.log('✅ Login successful:', user.email);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    created_at: user.created_at
                }
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Login failed. Please try again.' 
            });
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token, authorization denied' 
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token is not valid' 
            });
        }
        
        // Get user from database
        const users = await db.executeQuery(
            'SELECT id, username, email, full_name, phone, address, role, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('❌ Auth error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh token
// @access  Private
router.post('/refresh-token', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }

        const newToken = generateToken(decoded.id, decoded.role);
        
        res.json({
            success: true,
            token: newToken
        });
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to refresh token' 
        });
    }
});

module.exports = router;