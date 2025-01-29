const mongoose=require('mongoose')

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Project name
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true }, // Associated account
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members assigned to this project
  }, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;