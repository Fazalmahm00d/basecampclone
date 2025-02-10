// middleware/adminAuthMiddleware.js
const Account = require('../models/Account');
const User = require('../models/User');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    console.log(req.headers,"req header")
    const userId  = req.headers.userid; // Get from request headers
    const organizationName=req.headers["organization-name"]
    // const userId = req.user._id; // Assuming you have user info from previous auth middleware
    console.log(userId,organizationName,"headers print")
    // Find the account/organization
    const account = await Account.findOne({ name: organizationName });
    if (!account) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    // Find the user and check if they're an admin
    const user = await User.findOne({
      _id: userId,
      organizationName,
      role: 'admin'
    });

    if (!user) {
      return res.status(403).json({ 
        error: 'Unauthorized: Admin access required' 
      });
    }

    // Add account to request for use in routes
    req.organizationName = organizationName;
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = adminAuthMiddleware;