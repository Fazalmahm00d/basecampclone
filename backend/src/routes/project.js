const express = require('express');
const Project = require('../models/Project');
const projectRouter=express.Router()

projectRouter.post('/share-project', async (req, res) => {
    const { projectId, userId } = req.body;
  
    try {
      // Find the project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      // Add the user to the project's members list
      project.members.push(userId);
      await project.save();
  
      res.status(200).json({ message: 'Project shared successfully!', project });
    } catch (error) {
      console.error('Error sharing project:', error);
      res.status(500).json({ error: 'Failed to share project' });
    }
  });

  module.exports=projectRouter