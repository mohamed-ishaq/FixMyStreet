import api from './api';

// ============================================================================
// ISSUE MANAGEMENT (User)
// ============================================================================

/**
 * Get all issues with filters
 * @param {Object} params - Filter parameters
 * @returns {Promise} - API response
 */
export const getIssues = async (params = {}) => {
    try {
        const response = await api.get('/issues', { params });
        console.log('Get issues response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch issues:', error);
        return {
            success: false,
            data: {
                issues: [],
                page: 1,
                pages: 1,
                total: 0
            },
            message: error.response?.data?.message || 'Failed to fetch issues'
        };
    }
};

/**
 * Get current user's issues
 * @returns {Promise} - API response
 */
export const getMyIssues = async () => {
    try {
        const response = await api.get('/issues/myissues');
        console.log('Get my issues response:', response.data);
        
        // Handle different response structures
        if (response.data && response.data.success) {
            return response.data;
        } else if (response.data && response.data.data) {
            return { success: true, data: response.data.data };
        } else {
            return { success: true, data: response.data };
        }
    } catch (error) {
        console.error('Failed to fetch my issues:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Failed to fetch your issues'
        };
    }
};

/**
 * Get issue by ID
 * @param {number|string} id - Issue ID
 * @returns {Promise} - API response
 */
export const getIssueById = async (id) => {
    try {
        const response = await api.get(`/issues/${id}`);
        console.log('Get issue by ID response:', response.data);
        
        // Return in consistent format
        if (response.data && response.data.success) {
            return response.data;
        } else if (response.data && response.data.data) {
            return { success: true, data: response.data.data };
        } else {
            return { success: true, data: response.data };
        }
    } catch (error) {
        console.error('Failed to fetch issue:', error);
        throw error;
    }
};

/**
 * Create a new issue
 * @param {FormData|Object} issueData - Issue data (can be FormData for file upload)
 * @returns {Promise} - API response
 */
export const createIssue = async (issueData) => {
    try {
        // Configure headers based on data type
        const config = issueData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        
        const response = await api.post('/issues', issueData, config);
        console.log('Create issue response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create issue:', error);
        throw error;
    }
};

/**
 * Update an existing issue
 * @param {number|string} id - Issue ID
 * @param {Object} issueData - Updated issue data
 * @returns {Promise} - API response
 */
export const updateIssue = async (id, issueData) => {
    try {
        const response = await api.put(`/issues/${id}`, issueData);
        console.log('Update issue response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update issue:', error);
        throw error;
    }
};

/**
 * Delete an issue
 * @param {number|string} id - Issue ID
 * @returns {Promise} - API response
 */
export const deleteIssue = async (id) => {
    try {
        const response = await api.delete(`/issues/${id}`);
        console.log('Delete issue response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete issue:', error);
        throw error;
    }
};

/**
 * Add comment to an issue
 * @param {number|string} issueId - Issue ID
 * @param {Object} commentData - Comment data
 * @returns {Promise} - API response
 */
export const addComment = async (issueId, commentData) => {
    try {
        const response = await api.post(`/issues/${issueId}/comments`, commentData);
        console.log('Add comment response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to add comment:', error);
        throw error;
    }
};

/**
 * Get comments for an issue
 * @param {number|string} issueId - Issue ID
 * @returns {Promise} - API response
 */
export const getComments = async (issueId) => {
    try {
        const response = await api.get(`/issues/${issueId}/comments`);
        console.log('Get comments response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        return {
            success: false,
            comments: [],
            message: error.response?.data?.message || 'Failed to fetch comments'
        };
    }
};

/**
 * Delete a comment
 * @param {number|string} issueId - Issue ID
 * @param {number|string} commentId - Comment ID
 * @returns {Promise} - API response
 */
export const deleteComment = async (issueId, commentId) => {
    try {
        const response = await api.delete(`/issues/${issueId}/comments/${commentId}`);
        console.log('Delete comment response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete comment:', error);
        throw error;
    }
};

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

/**
 * Get all categories
 * @returns {Promise} - API response
 */
export const getCategories = async () => {
    try {
        const response = await api.get('/issues/categories');
        console.log('Get categories response:', response.data);
        
        // Return in consistent format
        if (response.data && response.data.categories) {
            return response.data;
        } else if (response.data && response.data.data) {
            return { success: true, categories: response.data.data };
        } else {
            return { success: true, categories: response.data };
        }
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return {
            success: false,
            categories: [],
            message: error.response?.data?.message || 'Failed to fetch categories'
        };
    }
};

/**
 * Get category by ID
 * @param {number|string} id - Category ID
 * @returns {Promise} - API response
 */
export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`/issues/categories/${id}`);
        console.log('Get category response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch category:', error);
        throw error;
    }
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get issue statistics
 * @returns {Promise} - API response
 */
export const getIssueStats = async () => {
    try {
        const response = await api.get('/issues/stats');
        console.log('Get issue stats response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch issue stats:', error);
        return {
            success: false,
            stats: {
                total: 0,
                pending: 0,
                in_progress: 0,
                resolved: 0,
                rejected: 0,
                byCategory: [],
                byStatus: []
            },
            message: error.response?.data?.message || 'Failed to fetch statistics'
        };
    }
};

/**
 * Get dashboard statistics (admin only)
 * @returns {Promise} - API response
 */
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/admin/dashboard');
        console.log('Get dashboard stats response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return {
            success: false,
            stats: {
                totalIssues: 0,
                totalUsers: 0,
                pendingIssues: 0,
                resolvedIssues: 0,
                issuesByStatus: [],
                issuesByCategory: [],
                recentIssues: []
            },
            message: error.response?.data?.message || 'Failed to fetch dashboard statistics'
        };
    }
};

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Get all users (admin only)
 * @param {Object} params - Filter parameters
 * @returns {Promise} - API response
 */
export const getUsers = async (params = {}) => {
    try {
        const response = await api.get('/admin/users', { params });
        console.log('Get users response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return {
            success: false,
            users: [],
            message: error.response?.data?.message || 'Failed to fetch users'
        };
    }
};

/**
 * Get user by ID (admin only)
 * @param {number|string} id - User ID
 * @returns {Promise} - API response
 */
export const getUserById = async (id) => {
    try {
        const response = await api.get(`/admin/users/${id}`);
        console.log('Get user response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
    }
};

/**
 * Update user (admin only)
 * @param {number|string} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} - API response
 */
export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/admin/users/${id}`, userData);
        console.log('Update user response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
    }
};

/**
 * Toggle user active status (admin only)
 * @param {number|string} id - User ID
 * @returns {Promise} - API response
 */
export const toggleUserStatus = async (id) => {
    try {
        const response = await api.put(`/admin/users/${id}/toggle-status`);
        console.log('Toggle user status response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to toggle user status:', error);
        throw error;
    }
};

/**
 * Delete user (admin only)
 * @param {number|string} id - User ID
 * @returns {Promise} - API response
 */
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/admin/users/${id}`);
        console.log('Delete user response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
};

/**
 * Get all issues (admin view)
 * @param {Object} params - Filter parameters
 * @returns {Promise} - API response
 */
export const getAllIssuesAdmin = async (params = {}) => {
    try {
        const response = await api.get('/admin/issues', { params });
        console.log('Get all issues admin response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all issues:', error);
        return {
            success: false,
            issues: [],
            pagination: {
                current_page: 1,
                total_pages: 1,
                total_items: 0,
                items_per_page: 20
            },
            message: error.response?.data?.message || 'Failed to fetch issues'
        };
    }
};

/**
 * Update issue status (admin only)
 * @param {number|string} id - Issue ID
 * @param {Object} statusData - Status update data
 * @returns {Promise} - API response
 */
export const updateIssueStatus = async (id, statusData) => {
    try {
        const config = statusData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await api.put(`/admin/issues/${id}/status`, statusData, config);
        console.log('Update issue status response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update issue status:', error);
        throw error;
    }
};

// ============================================================================
// CATEGORY MANAGEMENT (Admin)
// ============================================================================

/**
 * Create a new category (admin only)
 * @param {Object} categoryData - Category data
 * @returns {Promise} - API response
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/admin/categories', categoryData);
        console.log('Create category response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create category:', error);
        throw error;
    }
};

/**
 * Update category (admin only)
 * @param {number|string} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise} - API response
 */
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`/admin/categories/${id}`, categoryData);
        console.log('Update category response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update category:', error);
        throw error;
    }
};

/**
 * Delete category (admin only)
 * @param {number|string} id - Category ID
 * @returns {Promise} - API response
 */
export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/admin/categories/${id}`);
        console.log('Delete category response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete category:', error);
        throw error;
    }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Get user notifications
 * @returns {Promise} - API response
 */
export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        console.log('Get notifications response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return {
            success: false,
            notifications: [],
            message: error.response?.data?.message || 'Failed to fetch notifications'
        };
    }
};

/**
 * Mark notification as read
 * @param {number|string} id - Notification ID
 * @returns {Promise} - API response
 */
export const markNotificationRead = async (id) => {
    try {
        const response = await api.put(`/notifications/${id}/read`);
        console.log('Mark notification read response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 * @returns {Promise} - API response
 */
export const markAllNotificationsRead = async () => {
    try {
        const response = await api.put('/notifications/read-all');
        console.log('Mark all notifications read response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error;
    }
};

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Get user profile
 * @returns {Promise} - API response
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        console.log('Get profile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
    }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - API response
 */
export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/users/profile', profileData);
        console.log('Update profile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
    }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @returns {Promise} - API response
 */
export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/users/change-password', passwordData);
        console.log('Change password response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to change password:', error);
        throw error;
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format issue status for display
 * @param {string} status - Issue status
 * @returns {string} - Formatted status
 */
export const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get status color for badge
 * @param {string} status - Issue status
 * @returns {string} - Color code
 */
export const getStatusColor = (status) => {
    const colors = {
        pending: '#ffc107',
        in_progress: '#17a2b8',
        resolved: '#28a745',
        rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
};

/**
 * Get priority color for badge
 * @param {string} priority - Issue priority
 * @returns {string} - Color code
 */
export const getPriorityColor = (priority) => {
    const colors = {
        low: '#28a745',
        medium: '#ffc107',
        high: '#fd7e14',
        urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
};

// Export all functions as default
export default {
    // Issue management
    getIssues,
    getMyIssues,
    getIssueById,
    createIssue,
    updateIssue,
    deleteIssue,
    addComment,
    getComments,
    deleteComment,
    
    // Category management
    getCategories,
    getCategoryById,
    
    // Statistics
    getIssueStats,
    getDashboardStats,
    
    // Admin functions
    getUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getAllIssuesAdmin,
    updateIssueStatus,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Notifications
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    
    // Profile
    getProfile,
    updateProfile,
    changePassword,
    
    // Helpers
    formatStatus,
    getStatusColor,
    getPriorityColor
};
