const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['application_received', 'application_accepted', 'application_rejected', 'new_message', 'project_published', 'team_formed', 'deadline_reminder'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
