const axios = require('axios');

async function testAPI() {
    console.log('🔍 Testing Registration API...\n');
    
    const testData = {
        username: 'testuser_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: '123 Test Street',
        role: 'people'
    };
    
    console.log('📤 Sending registration request with data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');
    
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Registration successful!');
        console.log('📥 Response:', JSON.stringify(response.data, null, 2));
        
        // Test login with the same credentials
        console.log('\n🔍 Testing Login API...\n');
        
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: testData.email,
            password: testData.password
        });
        
        console.log('✅ Login successful!');
        console.log('📥 Response:', JSON.stringify(loginResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ API test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response from server. Is the backend running?');
            console.error('Make sure to run: npm run dev in the backend directory');
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAPI();