const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String }
}, { _id: false });

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  tasks: [taskSchema]
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  columns: [columnSchema]
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
