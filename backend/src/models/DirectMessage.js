// models/DirectMessage.js
const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  sentiment:{
    type:String
  },
  readAt: { 
    type: Date, 
    default: null 
  },
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account',
    required: true 
  }
}, { 
  timestamps: true 
});

// Create a compound index for efficient message retrieval
directMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
directMessageSchema.index({ accountId: 1 });

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
module.exports = DirectMessage;