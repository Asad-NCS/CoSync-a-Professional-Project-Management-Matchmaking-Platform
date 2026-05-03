const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: String },
  degree: { type: String },
  role: { type: String },
  skills: [{ type: String }],
  bio: { type: String },
  github: { type: String },
  linkedin: { type: String },
  avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
