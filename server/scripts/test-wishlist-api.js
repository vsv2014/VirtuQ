const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testWishlistAPI() {
  try {
    // Test 1: Server Health Check
    console.log('Testing server health...');
    const healthCheck = await axios.get(`${BASE_URL}/health`);
    console.log('Server health check:', healthCheck.status === 200 ? 'OK' : 'Failed');

    // Test 2: Authentication
    console.log('\nTesting authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    const token = loginResponse.data.token;
    console.log('Authentication:', token ? 'OK' : 'Failed');

    if (!token) {
      throw new Error('No token received from authentication');
    }

    // Test 3: Wishlist Endpoints with Authentication
    console.log('\nTesting wishlist endpoints...');
    const headers = { Authorization: `Bearer ${token}` };

    // Get wishlist
    const wishlist = await axios.get(`${BASE_URL}/wishlist`, { headers });
    console.log('Get wishlist:', wishlist.status === 200 ? 'OK' : 'Failed');

    // Add to wishlist
    const addToWishlist = await axios.post(`${BASE_URL}/wishlist/add`, { 
      productId: 'test-product-id' 
    }, { headers });
    console.log('Add to wishlist:', addToWishlist.status === 200 ? 'OK' : 'Failed');

    // Remove from wishlist
    const removeFromWishlist = await axios.delete(`${BASE_URL}/wishlist/remove/test-product-id`, { headers });
    console.log('Remove from wishlist:', removeFromWishlist.status === 200 ? 'OK' : 'Failed');

  } catch (error) {
    console.error('\nError occurred:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    }
  }
}

testWishlistAPI();
