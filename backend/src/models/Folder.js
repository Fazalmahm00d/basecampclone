const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }
  }, { timestamps: true });
  
const Folder = mongoose.model('Folder', folderSchema);
module.exports=Folder;