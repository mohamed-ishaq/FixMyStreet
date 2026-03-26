import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token added to request');
        } else {
            console.log('⚠️ No token found for request');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log(`📥 Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
            console.log('🔒 401 Unauthorized - Clearing token and redirecting');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;