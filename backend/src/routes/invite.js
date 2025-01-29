const express = require('express');
const inviteRouter = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');
const authMiddleware = require('../middleware/authMiddleWare');

// Separate middleware for invite token verification
// const inviteTokenMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'Invite token missing.' });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Attach decoded data to request
//     req.inviteData = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid or expired invite token.' });
//   }
// };
const verifyInviteToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  };
  const generateInviteToken = (payload) => {
    // Use the same JWT_SECRET for all operations
    const token = jwt.sign(
      {
        ...payload,
        type: 'invite' // Add type to distinguish from auth tokens
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log the token generation (remove in production)
    console.log('Generated token with secret:', {
      secret: process.env.JWT_SECRET?.substring(0, 3) + '...', // Only log first 3 chars
      payload
    });
    
    return token;
  };

  inviteRouter.post('/invite', authMiddleware, async (req, res) => {
    try {
      const { email, role = 'member' } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }
  
      // Generate a new invite token
      const token = generateInviteToken({ 
        email,
        role,
        accountId: req.user.accounts[0] // Assuming first account
      });
      const account = await Account.findOne({ admin: req.user._id });
      
      // Create the invitation URL
      const inviteUrl = `http://localhost:3000/invite?token=${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `You've been invited to ${account.name}!`,
        html: `
          <h2>Welcome to ${account.name}!</h2>
          <p>You've been invited as a <strong>${role}</strong>.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${invitationURL}">Accept Invitation</a>
        `,
      };
  
      // Send email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ 
        message: 'Invitation created successfully',
        inviteUrl,
        token // Remove this in production
      });
  
    } catch (error) {
      console.error('Failed to create invitation:', error);
      res.status(500).json({ error: 'Failed to create invitation' });
    }
  });


// Route to verify invitation (uses invite token middleware)
inviteRouter.get('/verify-invite', async (req, res) => {
    try {
      const { token } = req.query;
      console.log('Received token for verification:', token);
  
      if (!token) {
        return res.status(400).json({ error: 'Token is required.' });
      }
  
      // Log the verification attempt (remove in production)
      console.log('Attempting verification with secret:', {
        secret: process.env.JWT_SECRET?.substring(0, 3) + '...' // Only log first 3 chars
      });
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Successfully decoded token:', decoded);
  
      // Additional validation
      if (!decoded.email) {
        return res.status(400).json({ error: 'Invalid token format: missing email' });
      }
  
      res.status(200).json({
        email: decoded.email,
        role: decoded.role || 'member',
        accountId: decoded.accountId
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Invalid or expired invitation token.' });
    }
  });
// Route to accept invitation (uses invite token middleware)
inviteRouter.post('/accept-invite', async (req, res) => {

    try {
        console.log('Processing invite acceptance...');
    const { token, password } = req.body;
  
      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required.' });
      }
  
      // Verify the token
      const decoded = verifyInviteToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired invitation token.' });
      }
  
      // Check if user already exists
      let user = await User.findOne({ email: decoded.email });
      if (user) {
        return res.status(400).json({ error: 'User already exists.' });
      }
  
      // Check if account exists
      const account = await Account.findById(decoded.accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found.' });
      }
  
      // Create new user
      user = new User({
        email: decoded.email,
        password,
        role: decoded.role,
        provider: 'local',
        accounts: [decoded.accountId],
        status: 'active'
      });
  
      await user.save();
  
      // Add user to account
      account.members.push(user._id);
      await account.save();
  
      // Generate auth token
      const authToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.status(200).json({
        message: 'Registration successful',
        token: authToken
      });
    } catch (error) {
        console.error('Accept invite error:', error);
        res.status(500).json({ 
          error: 'Failed to process invitation.',
          details: error.message 
        });
    }
  });

module.exports = inviteRouter;


// routes/invite.js

// Separate middleware for invite token verification


// Public route - Verify invite token


// Public route - Accept invitation


// Protected route - Send invitation (requires authentication)


