// src/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyIdToken } = require('../config/firebase-admin');
const bcrypt = require('bcrypt');
const passport = require('passport');
const Account = require('../models/Account');

const authRoutes = express.Router();



authRoutes.post('/local/signup', async (req, res) => {
  try {
    const { email, password, username, organizationName } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if the organization (Account) exists
    let account = await Account.findOne({ name: organizationName });

    if (!account) {
      // Temporarily create the account without an admin
      account = await Account.create({
        name: organizationName,
      });
    }

    // Create the user and assign them to the organization
    const user = await User.create({
      email,
      username,
      password,
      provider: 'local',
      organizationName: account.name,
      role: account.admin ? 'organization_member' : 'admin', // First user becomes admin
    });

    // If the account doesn't have an admin, set the current user as admin
    if (!account.admin) {
      account.admin = user._id; // Assign admin
    }
    account.members.push(user._id); // Add user to members
    await account.save();

    // Create JWT
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' ,
        algorithm: 'HS256'
      },
      
    );

    // Set cookie
    res.cookie('token', token, {
      // httpOnly: true,
      httpOnly: true,
      secure: true, // Only sent over HTTPS
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ success: true, user, account });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});



authRoutes.post('/local/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication failed' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }

    // Create JWT
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' ,
        algorithm: 'HS256'
      }
    );

    // Set cookie
    res.cookie('token', token, {
      // httpOnly: true,
      httpOnly: true,
      secure: true, // Only sent over HTTPS
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true });
  })(req, res, next);
});


authRoutes.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Firebase token
    const decoded = await verifyIdToken(idToken);

    // Create/Update user
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          email: decoded.email,
          username: decoded.name || 'Anonymous',
          provider: 'google',
          firebaseUid: decoded.uid,
          profilePicture: decoded.picture, // Optional: Store profile picture
        },
      },
      { upsert: true, new: true }
    );

    // Create JWT
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' ,
        algorithm: 'HS256'
      }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Only sent over HTTPS
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

authRoutes.get('/me', async (req, res) => {
  try {
    // Verify cookie token
    const token = req.cookies.token;
    
    if (!token) return res.status(401).json({ authenticated: false });

    const decoded = jwt.decode(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.sub).select('-__v');

    if (!user) return res.status(401).json({ authenticated: false });

    res.json({ authenticated: true, user });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

authRoutes.post('/logout', (req, res) => {
  res.clearCookie('token', {
    // domain: process.env.COOKIE_DOMAIN,
    // httpOnly: true,
    secure: false,
    // sameSite: 'lax'
  });
  
  res.status(200).json({ success: true });
});

module.exports=authRoutes