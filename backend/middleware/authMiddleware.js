const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    console.log('🔐 Auth Middleware - Headers:', req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('Token received:', token.substring(0, 30) + '...');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded:', decoded);

            // Get user from token - query without profile_image
            const query = `
                SELECT id, username, email, full_name, phone, address, role, is_active
                FROM users 
                WHERE id = ?
            `;
            const users = await require('../config/database').executeQuery(query, [decoded.id]);
            const user = users[0];
            
            console.log('User found:', user ? user.email : 'Not found');

            if (!user) {
                console.log('User not found for ID:', decoded.id);
                res.status(401);
                throw new Error('Not authorized - User not found');
            }

            if (!user.is_active) {
                console.log('User account deactivated:', user.email);
                res.status(401);
                throw new Error('Not authorized - Account deactivated');
            }

            // Add user to request object
            req.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            
            console.log('✅ User authenticated:', req.user.email);

            next();
        } catch (error) {
            console.error('❌ Token verification error:', error.message);
            console.error('Error details:', error);
            res.status(401);
            throw new Error('Not authorized - Invalid token');
        }
    }

    if (!token) {
        console.log('❌ No token provided');
        res.status(401);
        throw new Error('Not authorized - No token provided');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};

const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const query = `
                SELECT id, username, email, full_name, role, is_active
                FROM users 
                WHERE id = ?
            `;
            const users = await require('../config/database').executeQuery(query, [decoded.id]);
            const user = users[0];
            
            if (user && user.is_active) {
                req.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
            }
        } catch (error) {
            // Ignore token errors for optional auth
            console.log('Optional auth failed:', error.message);
        }
    }
    
    next();
});

module.exports = { protect, admin, optionalAuth };