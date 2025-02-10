// routes/files.js
const express = require('express');
const fileRouter= express.Router();
// const multer = require('multer');
const Folder = require('../models/Folder');
const File = require('../models/File');
// const upload = multer({ dest: 'uploads/' });
const mongoose=require('mongoose')
const upload = require('../middleware/upload');

fileRouter.get('/:projectId/folders', async (req, res) => {
    const { projectId } = req.params;
    
    const folders = await Folder.find({ project: projectId });
    res.json(folders);
   });

   fileRouter.post('/:projectId/:userId/upload', upload.single('file'), async (req, res) => {
    try {
      const { projectId, userId } = req.params;
      let { folderId } = req.body;
  
      // Validate folderId
      if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
        folderId = null; // Set to null instead of empty string
      }
  
      // Ensure file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      // Store file details in MongoDB
      const newFile = new File({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        path: req.file.path, // Cloudinary file URL
        project: projectId,
        folder: folderId,
        uploadedBy: userId
      });
  
      await newFile.save();
      res.status(201).json(newFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  });
  
  module.exports = fileRouter;

  // fileRouter.post('/:projectId/:userId/upload', upload.single('file'), async (req, res) => {
  
  //   try {
  //     const { projectId, userId } = req.params;
  //     let { folderId } = req.body;
  
  //     // Validate folderId
  //     if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
  //         folderId = null; // Set to null instead of empty string
  //     }
  
  //     const newFile = new File({
  //     name: req.file.originalname,
  //     type: req.file.mimetype,
  //     size: req.file.size,
  //     path: `http://localhost:5000/uploads/${req.file.filename}`,
  //     project: projectId,
  //     folder: folderId,
  //     uploadedBy: userId // Now it's either a valid ObjectId or null
  //     });
  
  //     await newFile.save();
  //     res.status(201).json(newFile);
  // } catch (error) {
  //     console.error("Error uploading file:", error);
  //     res.status(500).json({ message: "Internal server error", error });
  // }
  // });

fileRouter.get('/:projectId/files', async (req, res) => {
  const { projectId } = req.params;
  const { folderId } = req.query;
  
  const query = { project: projectId };
  if (folderId) query.folder = folderId;
  
  const files = await File.find(query)
    .populate('uploadedBy', 'username');
  
  res.json(files);
});

fileRouter.post('/:projectId/folders', async (req, res) => {
  const { projectId } = req.params;
  const { name, parentId } = req.body;
  
  const folder = new Folder({
    name,
    project: projectId,
    parent: parentId
  });
  
  await folder.save();
  res.json(folder);
});
fileRouter.get('/:projectId/folders/:folderId', async (req, res) => {
    const { projectId, folderId } = req.params;
    
    const [folder, files, subFolders] = await Promise.all([
      Folder.findOne({ _id: folderId, project: projectId }),
      File.find({ folder: folderId, project: projectId }),
      Folder.find({ parent: folderId, project: projectId })
    ]);
    
    res.json({ folder, files, subFolders });
  });
  
  fileRouter.post('/:projectId/:userId/documents', async (req, res) => {
    const { projectId ,userId} = req.params;
    const { name, content, folderId } = req.body;
    
    const doc = new File({
      name,
      type: 'document',
      content,
      project: projectId,
      folder: folderId,
      size: Buffer.from(content).length,
      uploadedBy:userId,
      path: `/documents/${projectId}/${Date.now()}-${name}`
    });
    
    await doc.save();
    res.json(doc);
  });
module.exports = fileRouter;