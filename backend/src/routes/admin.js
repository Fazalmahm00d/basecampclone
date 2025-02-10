const express = require('express');
const adminRouter = express.Router();
const Account = require('../models/Account');
const User = require('../models/User');
const Project = require('../models/Project');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Apply admin middleware to all routes in this router
adminRouter.use(adminAuthMiddleware);

// 1. Add/Remove Administrators
adminRouter.post('/administrators', async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'add' or 'remove'
    // const account = req.account;
    const organizationName=req.organizationName
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (action === 'add') {
      targetUser.role = 'admin';
      await targetUser.save();
      res.json({ message: 'Administrator added successfully' });
    } else if (action === 'remove') {
      // Prevent removing the last admin
      const adminCount = await User.countDocuments({
        organizationName,
        role: 'admin'
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot remove the last administrator' 
        });
      }

      targetUser.role = 'member';
      await targetUser.save();
      res.json({ message: 'Administrator removed successfully' });
    }
  } catch (error) {
    console.error('Error managing administrators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Manage Groups (Projects)
adminRouter.post('/groups', async (req, res) => {
  try {
    const { name, members } = req.body;
    const organizationName = req.organizationName;

    const account = await  Account.findOne({name:organizationName})
    console.log(account,"account found")
    const newProject = new Project({
      name,
      account:account._id,
      members
    });

    await newProject.save();

    // Add project to account
    account.projects.push(newProject._id);
    await account.save();

    res.status(201).json({ 
      message: 'Group created successfully', 
      project: newProject 
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Rename Project
adminRouter.put('/projects/:projectId/rename', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newName } = req.body;
    const organizationName = req.organizationName;
    const account = await  Account.findOne({name:organizationName})

    const project = await Project.findOne({
      _id: projectId,
      account: account._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.name = newName;
    await project.save();

    res.json({ 
      message: 'Project renamed successfully', 
      project 
    });
  } catch (error) {
    console.error('Error renaming project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Merge Users (handle duplicate accounts)
adminRouter.post('/merge-users', async (req, res) => {
  try {
    const { primaryUserId, secondaryUserId } = req.body;
    const organizationName = req.organizationName;
    const account = await  Account.findOne({name:organizationName})
    
    const primaryUser = await User.findOne({
      _id: primaryUserId,
      accounts: account._id
    });
    const secondaryUser = await User.findOne({
      _id: secondaryUserId,
      accounts: account._id
    });

    if (!primaryUser || !secondaryUser) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Merge projects
    await Project.updateMany(
      { members: secondaryUserId },
      { $push: { members: primaryUserId } }
    );
    await Project.updateMany(
      { members: secondaryUserId },
      { $pull: { members: secondaryUserId } }
    );

    // Update secondary user status
    secondaryUser.status = 'inactive';
    await secondaryUser.save();

    res.json({ message: 'Users merged successfully' });
  } catch (error) {
    console.error('Error merging users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = adminRouter;