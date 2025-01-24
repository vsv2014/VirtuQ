const jwt = require('jsonwebtoken');

// Temporarily bypass all auth checks
const auth = (req, res, next) => {
  // Set a default test user
  req.user = { 
    id: 'test-user',
    role: 'user',
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
};

const adminAuth = (req, res, next) => {
  // Set a default admin user
  req.user = { 
    id: 'test-admin',
    role: 'admin',
    name: 'Test Admin',
    email: 'admin@example.com'
  };
  next();
};

module.exports = { auth, adminAuth };
