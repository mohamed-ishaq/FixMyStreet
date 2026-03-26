import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TestLogin = () => {
    const { user, login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            console.log('Login successful, token:', localStorage.getItem('token'));
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkToken = () => {
        const token = localStorage.getItem('token');
        console.log('Current token:', token);
        alert(`Token: ${token ? token.substring(0, 30) + '...' : 'No token found'}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Test Login</h2>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            {user && <p>User: {user.email}</p>}
            
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ margin: '5px', padding: '8px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ margin: '5px', padding: '8px' }}
                />
                <button type="submit" disabled={loading} style={{ margin: '5px', padding: '8px' }}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            
            <button onClick={checkToken} style={{ margin: '5px', padding: '8px' }}>
                Check Token
            </button>
        </div>
    );
};

export default TestLogin;