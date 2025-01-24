const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    // Test 1: Server Health Check
    console.log('1. Testing server health...');
    const healthCheck = await axios.get(`${BASE_URL}/health`);
    console.log('Health check response:', healthCheck.data);

    // Test 2: Authentication
    console.log('\n2. Testing authentication...');
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword'
    };
    console.log('Attempting login with:', loginData);
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('Login response:', loginResponse.data);

    // If login successful, test protected endpoints
    if (loginResponse.data.token) {
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };

      // Test 3: Get Products
      console.log('\n3. Testing products endpoint...');
      const products = await axios.get(`${BASE_URL}/products`, { headers });
      console.log('Products response:', products.data.length, 'products found');

      // Test 4: Get Wishlist
      console.log('\n4. Testing wishlist endpoint...');
      const wishlist = await axios.get(`${BASE_URL}/wishlist`, { headers });
      console.log('Wishlist response:', wishlist.data);
    }

  } catch (error) {
    console.error('\nError occurred:', {
      message: error.message,
      endpoint: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the tests
console.log('Starting API tests...\n');
testAPI();
