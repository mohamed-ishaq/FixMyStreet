import api from './api';

// Admin Statistics
export const getAdminStats = async () => {
    try {
        const response = await api.get('/admin/dashboard');
        console.log('Admin stats response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        throw error;
    }
};

// User Management
export const getUsers = async (filters = {}) => {
    try {
        const response = await api.get('/admin/users', { params: filters });
        console.log('Users response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
    }
};

export const toggleUserStatus = async (id) => {
    try {
        const response = await api.put(`/admin/users/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error('Failed to toggle user status:', error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
};

// Issue Management (Admin)
export const getAllIssues = async (params = {}) => {
    try {
        const response = await api.get('/admin/issues', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all issues:', error);
        throw error;
    }
};

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

// Category Management
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

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`/admin/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Failed to update category:', error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete category:', error);
        throw error;
    }
};

// System Logs
export const getSystemLogs = async () => {
    try {
        const response = await api.get('/admin/logs');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        throw error;
    }
};
