// routes/directMessageRouter.js
const express = require('express');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const Account = require('../models/Account');
const mongoose = require('mongoose');
const { HfInference } = require('@huggingface/inference');

require('dotenv').config();
console.log("Hugging Face API Key:", process.env.HUGGINGFACE_API_KEY);

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function detectMood(text) {
  const response = await hf.textClassification({
    model: "j-hartmann/emotion-english-distilroberta-base",
    inputs: text,
  });

  console.log(response); // Array of emotions with confidence scores
}

const directMessageRouter = express.Router();

// Get conversation list for a user
directMessageRouter.get('/conversations/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id; // Assuming you have authentication middleware

    // Find all unique conversations for this user
    const conversations = await DirectMessage.aggregate([
      {
        $match: {
          accountId: mongoose.Types.ObjectId(accountId),
          $or: [{ sender: userId }, { recipient: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$recipient',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          user: {
            _id: '$userDetails._id',
            username: '$userDetails.username',
            profilePicture: '$userDetails.profilePicture'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages between two users
directMessageRouter.get('/messages/:currentUserId/:userId', async (req, res) => {
    try {
      const { currentUserId, userId } = req.params;
      const { accountId } = req.query;
  
      console.log('Received params:', { currentUserId, userId, accountId });
  
      // Validate that all required IDs are present
      if (!currentUserId || !userId || !accountId) {
        return res.status(400).json({
          error: 'Missing required parameters',
          received: { currentUserId, userId, accountId }
        });
      }
  
      // Validate ObjectIds
      try {
        const validCurrentUserId = new mongoose.Types.ObjectId(currentUserId);
        const validUserId = new mongoose.Types.ObjectId(userId);
        const validAccountId = new mongoose.Types.ObjectId(accountId);
  
        const messages = await DirectMessage.find({
          accountId: validAccountId,
          $or: [
            { sender: validCurrentUserId, recipient: validUserId },
            { sender: validUserId, recipient: validCurrentUserId }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender', 'username profilePicture')
        .populate('recipient', 'username profilePicture');
  
        // Log for debugging
        console.log(`Found ${messages.length} messages`);
  
        // Check if we found any messages
        if (!messages || messages.length === 0) {
          return res.status(200).json([]); // Return empty array if no messages
        }
  
        res.json(messages.reverse());
  
      } catch (idError) {
        console.error('Invalid ID format:', idError);
        return res.status(400).json({
          error: 'Invalid ID format',
          details: idError.message
        });
      }
  
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        error: 'Failed to fetch messages',
        details: error.message,
        type: error.name
      });
    }
  });
directMessageRouter.post('/messages', async (req, res) => {
    try {
      const { recipientId, content, accountId,senderId } = req.body;
       // Assuming you have authentication middleware
       console.log(content,"content")
      const sentiment=await detectMood(content);
      console.log(sentiment,"sentiment")
      // Validate that both users are members of the account
      const account = await Account.findById(accountId);
      if (!account.members.includes(senderId) || !account.members.includes(recipientId)) {
        return res.status(403).json({ error: 'Users must be members of the same account' });
      }
  
      const message = new DirectMessage({
        sender: senderId,
        recipient: recipientId,
        content,
        accountId,
        sentiment:sentiment[0].label
      });
  
      await message.save();
      console.log("msg created",message)
      // Populate sender details for the response
      await message.populate('sender', 'username profilePicture');
  
      // Emit socket event if socket.io instance is available
       // Emit socket event
       
    if (req.io) {
        console.log('Socket IO instance found');
        console.log("Message route debug:", {
          hasIO: !!req.io,
          recipientId: req.body.recipientId,
          connectedUsers: req.io?.connectedUsers ? Array.from(req.io.connectedUsers.entries()) : 'No users map'
        })
        // Use the room feature to emit to specific user
        req.io.to(recipientId).emit('new-direct-message', message);
        console.log('Message emitted to recipient room:', recipientId);
      } else {
        console.log('No Socket IO instance available');
      }
  
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  });
  
  // Mark messages as read
  directMessageRouter.post('/messages/read', async (req, res) => {
    try {
      const { senderId, accountId } = req.body;
      const recipientId = req.user._id;
  
      // Update all unread messages from this sender to this recipient
      const result = await DirectMessage.updateMany(
        {
          sender: senderId,
          recipient: recipientId,
          accountId,
          readAt: null
        },
        {
          readAt: new Date()
        }
      );
  
      // Emit socket event for read receipts if socket.io instance is available
      if (req.io) {
        const senderSocketId = req.io.connectedUsers.get(senderId);
        if (senderSocketId) {
          req.io.to(senderSocketId).emit('messages-read', {
            by: recipientId,
            at: new Date()
          });
        }
      }
  
      res.json({ 
        success: true, 
        messagesMarkedAsRead: result.modifiedCount 
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  });
  
  // Delete a message (optional feature)
  directMessageRouter.delete('/messages/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;
  
      const message = await DirectMessage.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      // Only allow sender to delete the message
      if (message.sender.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this message' });
      }
  
      await message.delete();
  
      // Emit socket event for message deletion if socket.io instance is available
      if (req.io) {
        const recipientSocketId = req.io.connectedUsers.get(message.recipient.toString());
        if (recipientSocketId) {
          req.io.to(recipientSocketId).emit('message-deleted', messageId);
        }
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  });

module.exports = directMessageRouter;