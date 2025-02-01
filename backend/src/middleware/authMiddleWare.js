const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  console.log('Auth Middleware executing for path:', req.path);
  console.log('Auth header:', req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Bearer token found in authorization header');
    return res.status(401).json({ error: 'Unauthorized access. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('Signing with secret:', process.env.JWT_SECRET);
    console.log('token',token)
    // Verify the token
    const user = jwt.decode(token, process.env.JWT_SECRET);
    console.log('Token decoded in middleware:', user);
    // Find the user associated with the token
    // const user = await User.findById(decoded.userId);
    if (!user) {
        console.log('No user found for ID:');
      return res.status(401).json({ error: 'Unauthorized access. User not found.' });
    }

    // Attach the user to the request object
    req.user = user;

    next(); // Pass control to the next middleware
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ 
      error: 'Unauthorized access. Invalid token.',
      details: error.message 
    });
  }
};

module.exports = authMiddleware;
