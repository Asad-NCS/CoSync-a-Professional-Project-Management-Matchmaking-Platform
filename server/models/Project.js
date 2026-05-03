const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skills: [{ type: String }],
  count: { type: Number, default: 1 }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: { type: String },
  category: { type: String },
  description: { type: String, required: true },
  problem: { type: String },
  roles: [roleSchema],
  teamSize: { type: String },
  duration: { type: String },
  difficulty: { type: String },
  stack: [{ type: String }],
  stack_details: { type: String },
  deadline: { type: Date },
  perks: [{ type: String }],
  applicationQuestion: { type: String },
  github: { type: String },
  figma: { type: String },
  website: { type: String },
  isRemote: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  requireCoverLetter: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
