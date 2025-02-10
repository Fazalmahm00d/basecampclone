// models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  content: { type: Buffer } ,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);
module.exports=File;