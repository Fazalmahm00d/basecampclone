// models/GroupChat.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Make sure this is correctly referenced
    required: true 
  },
  content: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const groupChatSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  messages: [messageSchema],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const GroupChat = mongoose.model('GroupChat', groupChatSchema);
module.exports = GroupChat;