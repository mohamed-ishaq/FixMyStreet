import api from './api';

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        console.log('Raw login response:', response);
        return response.data; // Your backend returns { success, token, user }
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        // Make sure the field names match your backend expectations
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Register API error:', error);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        console.log('Raw profile response:', response);
        return response.data; // Your backend returns { success, user }
    } catch (error) {
        console.error('Profile API error:', error);
        throw error;
    }
};