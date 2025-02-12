const express = require('express');
const inviteRouter = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleWare');
const nodemailer = require('nodemailer');
const Account = require('../models/Account');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate invite token with admin and account info
const generateInviteToken = (payload) => {
  const token = jwt.sign(
    {
      ...payload,
      type: 'invite'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
  return token;
};

// Verify invite token
const verifyInviteToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    
    if (decoded.type !== 'invite') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Send invite route
inviteRouter.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { adminemail,email, role = 'member',organizationName } = req.body;

    console.log(req.user,"user sending invite")
    const receiverId = req.user._id;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Find the admin's account
    const adminUser = await User.findOne({ email: adminemail });
    console.log(adminUser,"admin user")
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }

    // Find the account where this admin is the admin - use _id directly
    const account = await Account.findOne({ admin: adminUser._id });
    console.log(account,"<account found>")
    // Generate token with admin and account info
    const token = generateInviteToken({ 
      email,
      role,
      organizationName,
      accountId: account._id,
      adminId:adminUser._id,
      receiverId: receiverId,
      accountName: account.name
    });

    // Create invitation URL
    const inviteUrl = `http://localhost:3000/invite?token=${token}`;
    
    // Setup email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `You've been invited to join ${organizationName}!`,
      html: `
        <h2>Welcome to ${organizationName}!</h2>
        <p>You've been invited as a <strong>${role}</strong>.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}">Accept Invitation</a>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Invitation sent successfully',
      inviteUrl
    });

  } catch (error) {
    console.error('Failed to create invitation:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Verify invite route
inviteRouter.get('/verify-invite', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required.' });
    }

    const decoded = verifyInviteToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired invitation token.' });
    }

    res.status(200).json({
      email: decoded.email,
      role: decoded.role,
      accountId: decoded.accountId,
      accountName: decoded.accountName,
      organizationName: decoded.organizationName,
      adminId: decoded.adminId
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired invitation token.' });
  }
});

// Accept invite route
inviteRouter.post('/accept-invite', async (req, res) => {
  try {
    console.log('Processing invite acceptance...');
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required.' });
    }

    // Verify token
    const decoded = verifyInviteToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired invitation token.' });
    }
    console.log(decoded,"decoded in accept invite")
    // Check if user already exists
    let user = await User.findOne({ email: decoded.email });
    if (user) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    
    // Find the account
    const account = await Account.findOne({admin: decoded.adminId});
    console.log(account,"account found")
    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Create new user
    user = new User({
      email: decoded.email,
      password,
      role: decoded.role,
      organizationName: decoded.organizationName,
      provider: 'local',
      accounts: [decoded.accountId],
      status: 'active'
    });

    await user.save();
    console.log('New user created:', user._id);

    // Add user to account members
    account.members.push(user._id);
    await account.save();
    console.log('User added to account:', account._id);

    // Generate auth token
    const authToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationName: decoded.organizationName,
        accountId: decoded.accountId
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );

    res.status(200).json({
      message: 'Registration successful',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        accountId: decoded.accountId,
        organizationName: decoded.organizationName,
        accountName: decoded.accountName
      }
    });

  } catch (error) {
    console.error('Accept invite error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid invitation token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invitation token has expired.' });
    }
    
    res.status(500).json({ 
      error: 'Failed to process invitation.',
      details: error.message
    });
  }
});

module.exports = inviteRouter;