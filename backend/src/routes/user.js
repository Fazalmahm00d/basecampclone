const express = require('express');
const User = require('../models/User');
const userRoutes=express.Router()
const Account=require('../models/Account')
userRoutes.put('/profile', async (req, res) => {
  console.log("inside func")
  const { email } = req.query;
  const { username, profilePicture, organizationName } = req.body;

  try {
      if (!email) {
          return res.status(400).json({ error: 'Email is required' });
      }

      // Find the user and populate their current data
      const user = await User.findOne({ email });
      
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Create update object with allowed fields for all users
      let updateFields = {};
      if (username) updateFields.username = username;
      if (profilePicture) updateFields.profilePicture = profilePicture;

      // Only process organization name change if it's different from current
      if (organizationName && organizationName !== user.organizationName) {
          if (user.role !== 'admin') {
              return res.status(403).json({ error: 'Only administrators can change organization names' });
          }

          const orgExists = await Account.findOne({ name: organizationName });
          if (orgExists) {
              return res.status(400).json({ error: "Organization name already exists" });
          }

          const account = new Account({
              name: organizationName,
              admin: user._id,
              members: [user._id]
          });

          await account.save();
          user.accounts.push(account._id);
          updateFields.organizationName = organizationName;
      }

      // Update user with allowed fields
      const updatedUser = await User.findOneAndUpdate(
          { email },
          updateFields,
          { new: true }
      );

      res.json(updatedUser);

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});
userRoutes.get('/user-id', async (req, res) => {
    try {
        const { email } = req.query; // Extract email from query params

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email }).select('_id');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ userId: user._id });
    } catch (error) {
        console.error('Error fetching user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  module.exports=userRoutes