const express = require('express');
const User = require('../models/User');
const userRoutes=express.Router()


userRoutes.put('/profile', async (req, res) => {
    console.log("inside func")
    const { email } = req.query; // Extract email from query parameters
    const { username, profilePicture, organizationName } = req.body;
  
    try {
      // Validate the presence of email
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
     
  
      // Find user by email and update
      const updatedUser = await User.findOneAndUpdate(
        { email }, // Find user by email
        {
          ...(username && { username }),
          ...(profilePicture && { profilePicture }),
          ...(organizationName && { organizationName })
        },
        { new: true } // Return the updated user
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports=userRoutes