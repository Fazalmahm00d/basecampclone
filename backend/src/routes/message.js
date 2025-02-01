const express = require("express");
const messageRoutes = express.Router();
const Message = require("../models/Message");

// Create a new message
messageRoutes.post("/", async (req, res) => {
  try {
    const { content, project, sender, parentMessage, subject, category } = req.body;

    const newMessage = new Message({ 
      content, 
      project, 
      sender, 
      parentMessage,
      subject,    // Optional field
      category    // Optional field
    });
    
    const savedMessage = await newMessage.save();

    // If this is a reply, update the parent message
    if (parentMessage) {
      await Message.findByIdAndUpdate(parentMessage, {
        $push: { replies: savedMessage._id },
      });
    }

    // Populate the sender information before sending response
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "username" },
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error creating message", error: error.message });
  }
});

// Get all messages for a project
messageRoutes.get("/:projectId", async (req, res) => {
  try {
    const messages = await Message.find({ project: req.params.projectId, parentMessage: null })
      .populate("sender", "username")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "username" },
      })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});
messageRoutes.post("/:messageId/reply", async (req, res) => {
  try {
    const { content, sender } = req.body;
    
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Add new reply to the message
    message.replies.push({
      content,
      sender,
      createdAt: new Date()
    });

    await message.save();

    // Return populated message
    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "username")
      .populate("replies.sender", "username");

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error adding reply", error: error.message });
  }
});


// Get messages by category
messageRoutes.get("/:projectId/category/:category", async (req, res) => {
  try {
    const messages = await Message.find({ 
      project: req.params.projectId, 
      parentMessage: null,
      category: req.params.category 
    })
      .populate("sender", "username")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "username" },
      })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// Get a specific message with its replies
messageRoutes.get("/message/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate("sender", "username")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "username" },
      });

    if (!message) return res.status(404).json({ message: "Message not found" });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Error fetching message", error: error.message });
  }
});

// Add reaction to a message
messageRoutes.post("/react/:messageId", async (req, res) => {
  try {
    const { userId, emoji } = req.body;

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Check if reaction exists
    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);
    if (reactionIndex !== -1) {
      // Add user if emoji exists and user hasn't reacted yet
      if (!message.reactions[reactionIndex].users.includes(userId)) {
        message.reactions[reactionIndex].users.push(userId);
      }
    } else {
      // Add new reaction
      message.reactions.push({ emoji, users: [userId] });
    }

    await message.save();
    
    // Return populated message
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "username" },
      });

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error adding reaction", error: error.message });
  }
});

module.exports = messageRoutes;