import axios from 'axios';

// Test authentication APIs
const API_BASE = 'http://localhost:3000/api';

async function testAuthAPIs() {
  console.log('🚀 Testing Authentication APIs...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing User Registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      department: 'IT',
      title: 'Software Developer'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful:', {
      status: registerResponse.status,
      message: registerResponse.data.message,
      userId: registerResponse.data.user.id,
      userEmail: registerResponse.data.user.email
    });

    // Test 2: Login with the registered user
    console.log('\n2️⃣ Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful:', {
      status: loginResponse.status,
      hasAccessToken: !!loginResponse.data.accessToken,
      hasRefreshToken: !!loginResponse.data.refreshToken,
      userEmail: loginResponse.data.user.email,
      userRoles: loginResponse.data.user.roles
    });

    const accessToken = loginResponse.data.accessToken;

    // Test 3: Access protected route
    console.log('\n3️⃣ Testing Protected Route Access...');
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected route access successful:', {
      status: meResponse.status,
      userEmail: meResponse.data.email,
      userName: meResponse.data.name
    });

    // Test 4: Test invalid login
    console.log('\n4️⃣ Testing Invalid Login...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid login correctly rejected:', error.response.status);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Test duplicate registration
    console.log('\n5️⃣ Testing Duplicate Registration...');
    try {
      await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('❌ Duplicate registration should have failed');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ Duplicate registration correctly rejected:', error.response.status);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All authentication tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run tests if server is running
testAuthAPIs();
