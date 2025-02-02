const express = require('express');
const Project = require('../models/Project');
const projectRouter=express.Router()
const Account = require("../models/Account");
const authMiddleware = require('../middleware/authMiddleWare');
const GroupChat = require('../models/GroupChat');

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
  projectRouter.get('/:organizationName', async (req, res) => {
    try {
      // First get the user's account
      console.log("inside get")
      const organizationName=req.params.organizationName
      const account = await Account.findOne({ name: organizationName });
  
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
  
      // Then get all projects for this account with populated members
      const projects = await Project.find({ account: account._id })
        .populate('members', 'username email')
        .lean();
  
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// GET all projects inside an organization
// projectRouter.get("/", authMiddleware, async (req, res) => {
//   try {
//     const userAccount = await Account.findOne({ admin: req.user._id }).populate("projects");

//     if (!userAccount) {
//       return res.status(404).json({ error: "Organization not found" });
//     }

//     res.status(200).json(userAccount.projects);
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

projectRouter.get('/org/:projectId', async (req, res) => {
  try {
      const { projectId } = req.params;

      // Fetch project details and populate members with user details
      const project = await Project.findById(projectId).populate('members', 'username email');

      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
  } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
// POST - Create a new project
projectRouter.post("/", async (req, res) => {
  console.log("inside the project post")
  const { name, members ,organizationName} = req.body;
  

  try {
    const account = await Account.findOne({ name: organizationName});

    if (!account) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const newProject = new Project({
      name,
      account: account._id,
      members: members || [], // Assign selected members
    });
    await GroupChat.create({
      project: newProject._id,
      participants: newProject.members
    });

    await newProject.save();

    // Add the project to the account
    account.projects.push(newProject._id);
    await account.save();

    res.status(201).json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT - Add members to an existing project
projectRouter.put("/:projectId/members", authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { members } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    project.members.push(...members);
    await project.save();

    res.status(200).json({ message: "Members added successfully", project });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

projectRouter.get("/:projectId/messages",async(req,res)=>{
  const  projectId  = req.params.projectId;
  
  const chat = await GroupChat.findOne({ project: projectId })
    .populate({
      path: 'messages.sender',
      select: '_id username'
    });
    
  res.json(chat.messages);
})
module.exports = projectRouter;
