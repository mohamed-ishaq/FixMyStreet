import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            console.log('Token found in localStorage, loading user...');
            loadUser();
        } else {
            console.log('No token found, setting loading to false');
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            console.log('Fetching user profile with token:', token);
            const response = await getProfile();
            console.log('Profile response:', response);
            
            if (response && response.success && response.user) {
                setUser(response.user);
                localStorage.setItem('userRole', response.user.role);
                localStorage.setItem('user', JSON.stringify(response.user));
                console.log('User loaded successfully:', response.user);
            } else {
                console.error('Invalid profile response:', response);
                // If profile fetch fails but we have token, try to use stored user
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    logout();
                }
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            if (error.response?.status === 401) {
                console.log('Token invalid, logging out');
                logout();
            } else {
                // Use stored user data if available
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', email);
            const response = await apiLogin(email, password);
            console.log('Login response:', response);
            
            if (response && response.success && response.token && response.user) {
                const { token, user } = response;
                console.log('Login successful, token:', token.substring(0, 20) + '...');
                console.log('User:', user);
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('userRole', user.role);
                
                setToken(token);
                setUser(user);
                
                toast.success(response.message || 'Login successful!');
                return { success: true, user };
            } else {
                console.error('Invalid login response format:', response);
                throw new Error(response?.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || error.message || 'Login failed');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiRegister(userData);
            
            if (response && response.success) {
                toast.success(response.message || 'Registration successful! Please login.');
                return { success: true, message: response.message };
            } else {
                throw new Error(response?.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || error.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        console.log('Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};