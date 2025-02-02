// routes/groupChat.js
const express = require('express');
const grpchatRouter= express.Router();
const GroupChat = require('../models/GroupChat');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Create a new group chat for a project
grpchatRouter.post('/projects/:projectId/chat',async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if chat already exists
    const existingChat = await GroupChat.findOne({ project: projectId });
    if (existingChat) {
      return res.status(400).json({ message: 'Chat already exists for this project' });
    }

    // Get project to verify members
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newChat = await GroupChat.create({
      project: projectId,
      participants: project.members
    });

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group chat', error: error.message });
  }
});

// Get chat messages for a project
grpchatRouter.get('/projects/:projectId/chat/messages', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      console.log("Fetching chat for project:", projectId);
      
      // Convert string values to numbers
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      // Validate projectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
  
      // Find the chat and populate in steps for better error tracking
      let chat = await GroupChat.findOne({ project: projectId });
      
      console.log("Initial chat found:", chat ? "yes" : "no");
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
  
      // Populate messages with pagination
      chat = await GroupChat.findOne({ project: projectId })
        .populate({
          path: 'messages',
          options: {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
            sort: { createdAt: -1 } // Sort messages by newest first
          },
          populate: {
            path: 'sender',
            model: 'User',
            select: 'username email profilePicture'
          }
        })
        .lean();
  
      console.log("Messages count:", chat?.messages?.length || 0);
  
      // Remove auth check temporarily for testing
      // if (!chat.participants.includes(req.user._id)) {
      //   return res.status(403).json({ message: 'Not authorized to view this chat' });
      // }
  
      res.json({
        messages: chat.messages || [],
        hasMore: (chat.messages || []).length === limitNum
      });
  
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ 
        message: 'Error fetching messages', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

// Add a message to chat
grpchatRouter.post('/projects/:projectId/chat/messages',  async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content,userId } = req.body;
    

    const chat = await GroupChat.findOne({ project: projectId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    console.log("chat found in grp chat",chat)

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }
    const newMessage = {
      sender: userId,
      content,
      readBy: [userId]
    };
    console.log(newMessage,"new message")

    chat.messages.push(newMessage);
    chat.lastActivity = Date.now();
    await chat.save();

    // Populate sender info before sending response
    const populatedChat = await GroupChat.findOne({ project: projectId })
      .populate({
        path: 'messages.sender',
        select: 'username email profilePicture'
      })
      .slice('messages', -1); // Get only the last message
    console.log(populatedChat,"populated chat")
    const addedMessage = populatedChat.messages[populatedChat.messages.length - 1];
      console.log(addedMessage,"added message")
    // Emit to socket if needed (you might handle this differently)
    req.app.get('io').to(`project-${projectId}`).emit('new-message', addedMessage);

    res.status(201).json(addedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error: error.message });
  }
});

// Mark messages as read
grpchatRouter.post('/projects/:projectId/chat/messages/read',  async (req, res) => {
  try {
    const { projectId } = req.params;
    const { messageIds } = req.body;

    const result = await GroupChat.updateMany(
      { 
        project: projectId,
        'messages._id': { $in: messageIds }
      },
      { 
        $addToSet: { 'messages.$[].readBy': req.user._id }
      }
    );

    res.json({ success: true, updated: result.nModified });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

// Get chat participants
grpchatRouter.get('/projects/:projectId/chat/participants', async (req, res) => {
  try {
    const { projectId } = req.params;

    const chat = await GroupChat.findOne({ project: projectId })
      .populate('participants', 'username email profilePicture')
      .select('participants');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat.participants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participants', error: error.message });
  }
});

module.exports = grpchatRouter;