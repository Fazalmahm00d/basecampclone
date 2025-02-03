const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

const accountRouter = express.Router();

// Utility to validate account and user existence
const validateAccountAndUser = async (accountId, userId) => {
  const account = await Account.findById(accountId).populate('members');
  const user = await User.findById(userId);
  if (!account) throw new Error('Account not found.');
  if (!user) throw new Error('User not found.');

  return { account, user };
};

accountRouter.get("/id/:organizationName", async (req, res) => {
  try {
    const { organizationName } = req.params;
    console.log("Fetching account ID for organization:", organizationName);

    // Find the account by organization name
    const account = await Account.findOne({ name: organizationName })
      .select('_id name')
      .lean();

    if (!account) {
      console.log("No account found for organization:", organizationName);
      return res.status(404).json({ error: "Organization not found" });
    }

    console.log("Found account:", account);
    res.status(200).json({
      accountId: account._id,
      name: account.name
    });

  } catch (error) {
    console.error("Error fetching account ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

accountRouter.post('/', async (req, res) => {
    const { name, adminId } = req.body;
  
    try {
      // Ensure the admin exists
      const admin = await User.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin user not found.' });
      }
  
      // Create a new account
      const account = new Account({
        name,
        admin: admin._id,
        members: [admin._id], // Admin is automatically a member
      });
  
      await account.save();
  
      // Add the account to the admin's accounts list
      admin.accounts.push(account._id);
      await admin.save();
  
      res.status(201).json({ message: 'Account created successfully!', account });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create account.' });
    }
  });

// 1. Add a Member to an Account
accountRouter.post('/:accountId/members', async (req, res) => {
  const { accountId } = req.params;
  const { userId } = req.body;

  try {
    const { account, user } = await validateAccountAndUser(accountId, userId);

    // Add user to account members if not already added
    if (!account.members.includes(userId)) {
      account.members.push(userId);
      await account.save();
    }

    // Add account to user's accounts if not already added
    if (!user.accounts.includes(accountId)) {
      user.accounts.push(accountId);
      await user.save();
    }

    res.status(200).json({ message: 'User added to account successfully!', account });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// 2. Remove a Member from an Account
accountRouter.delete('/:accountId/members/:userId', async (req, res) => {
  const { accountId, userId } = req.params;

  try {
    const { account, user } = await validateAccountAndUser(accountId, userId);

    // Remove user from account's members
    account.members = account.members.filter((memberId) => memberId.toString() !== userId);
    await account.save();

    // Remove account from user's accounts
    user.accounts = user.accounts.filter((accId) => accId.toString() !== accountId);
    await user.save();

    res.status(200).json({ message: 'User removed from account successfully!', account });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// 3. Update a Member's Role
accountRouter.put('/:accountId/members/:userId/role', async (req, res) => {
  const { accountId, userId } = req.params;
  const { role } = req.body;

  try {
    const { user } = await validateAccountAndUser(accountId, userId);

    // Update the user's role (make sure role is valid)
    const validRoles = ['admin', 'organization_member', 'external_collaborator', 'client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully!', user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});


// 4. List All Members in an Account
accountRouter.get('/:accountId/members', async (req, res) => {
  const { accountId } = req.params;

  try {
    const account = await Account.findById(accountId).populate('members');
    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    res.status(200).json({ members: account.members });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// 5. Get a Specific Member's Details in an Account
accountRouter.get('/:accountId/members/:userId', async (req, res) => {
  const { accountId, userId } = req.params;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const { account, user } = await validateAccountAndUser(accountId, userObjectId);

    console.log(account.members, userId, "finding user ....");

    // Fix: Ensure userObjectId is compared properly with members' ObjectIds
    const isMember = account.members.some(member => member._id.equals(userObjectId));
    if (!isMember) {
      return res.status(404).json({ error: 'User is not a member of this account.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

accountRouter.get("/members/:organizationName", async (req, res) => {
  console.log("get member calling")
  const organizationName=req.params.organizationName
  try {
    console.log(organizationName,"admin org")
    const account = await Account.findOne({name: organizationName})
      .populate("members", "username email role") // Populate with relevant user fields
      .lean(); // Use lean() for better performance when we only need JSON data
    console.log("account found",account)
    if (!account) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Transform the data to include only necessary fields
    const members = account.members.map(member => ({
      _id: member._id,
      username: member.username,
      email: member.email,
      role: member.role
    }));

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = accountRouter;
