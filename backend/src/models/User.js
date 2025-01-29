const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true }, // Unique but optional for Google users
  username: { type: String },
  password: { type: String }, // Only for local users
  provider: { type: String, required: true, enum: ['local', 'google'] }, // Authentication provider
  firebaseUid: { type: String, sparse: true }, // Sparse index
  profilePicture: { type: String }, // Optional for both
  organizationName: { type: String, ref: 'Account', default: null }, // Organization the user belongs to
  role: { type: String, enum: ['admin', 'organization_member', 'external_collaborator', 'client'], default: 'admin' }, // Role in the system
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who invited this user
  status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' }, // Invitation status
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }], // Accounts the user belongs to
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], // Projects the user is part of
}, { timestamps: true }); // Adds createdAt and updatedAt

// Hash password before saving (only for local users)
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.provider === 'local') {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
