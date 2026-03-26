const axios = require('axios');

async function testBackend() {
    try {
        console.log('Testing backend endpoints...');
        
        // Test login
        console.log('\n1. Testing login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'user@example.com',
            password: 'user123'
        });
        console.log('Login response:', loginResponse.data);
        
        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            
            // Test profile with token
            console.log('\n2. Testing profile with token...');
            const profileResponse = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Profile response:', profileResponse.data);
        }
        
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testBackend();