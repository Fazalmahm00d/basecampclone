// routes/events.js
const express = require('express');
const eventRouter = express.Router();
const Event = require('../models/Event');
const Project = require('../models/Project');
const Account = require('../models/Account');

// Middleware to check project access
const checkProjectAccess = async (req, res, next) => {
  try {
    // Get project and check if user is a member
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project or account
    const isMember = project.members.includes(req.user._id) || 
                    req.user.projects.includes(project._id) ||
                    req.user.accounts.includes(project.account);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
eventRouter.get('/projects/:projectId/events',async (req, res) => {
    try {
    console.log("event fetch called")
      const events = await Event.find({ 
        project: req.params.projectId 
      })
      .populate('createdBy', 'username email')
      .sort({ start: 1 });
      // Ensure we always return an array
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: error.message, events: [] });  // Include empty events array in error response
    }
  });

// // Get all events for a project
// eventRouter.get('/projects/:projectId/events', checkProjectAccess, async (req, res) => {
//   try {
//     const events = await Event.find({ 
//       project: req.params.projectId 
//     })
//     .populate('createdBy', 'username email')
//     .sort({ start: 1 });
    
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Get all events for an account (organization)
eventRouter.get('/accounts/:organizationName/events', async (req, res) => {
  try {

    const events = await Event.find({ 
      organizationName: req.params.organizationName
    })
    .populate('project', 'name')
    .populate('createdBy', 'username email')
    .sort({ start: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new event for a project
eventRouter.post('/projects/:projectId/events', async (req, res) => {
  try {
    const { title, start, end, allDay,userId,organizationName } = req.body;
    console.log("event add called",req.body)
    const event = new Event({
      title,
      start,
      end,
      allDay,
      project: req.params.projectId,
      organizationName,
      createdBy: userId
    });
    console.log(event,"event b4 saving")

    await event.save();
    console.log("event saved")
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'username email')
      .populate('project', 'name');

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an event
eventRouter.put('/projects/:projectId/events/:eventId', checkProjectAccess, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      project: req.params.projectId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'start', 'end', 'allDay'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => event[update] = req.body[update]);
    await event.save();
    
    const updatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'username email')
      .populate('project', 'name');

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an event
eventRouter.delete('/projects/:projectId/events/:eventId', checkProjectAccess, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.eventId,
      project: req.params.projectId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = eventRouter;