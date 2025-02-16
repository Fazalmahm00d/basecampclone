const express = require('express');
const User = require('../models/User');
const userRoutes=express.Router()
const Account=require('../models/Account')
userRoutes.put('/profile', async (req, res) => {
    console.log("inside func")
    const { email } = req.query; // Extract email from query parameters
    const { username, profilePicture, organizationName } = req.body;
  
    try {
      // Validate the presence of email
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
     const user=await User.findOne({ email })
     if(user.role==='admin'){

        const orgExists=await Account.findOne({ name :organizationName})

        if(orgExists){
          return res.status(404).json({ error: "Org name already exists"})
        }else{
        const account = new Account({
          name:organizationName,
          admin: user._id,
          members: [user._id], // Admin is automatically a member
        });
    
        await account.save();
    
        // Add the account to the admin's accounts list
        user.accounts.push(account._id);
        await user.save();
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
    } else{
      return res.status(404).json({ error: 'You are not authorized' });
    }
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