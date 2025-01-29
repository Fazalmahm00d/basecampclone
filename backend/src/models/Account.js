const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Account/Organization name
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Admin user (optional initially)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members of the account
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], // Projects under this account
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
