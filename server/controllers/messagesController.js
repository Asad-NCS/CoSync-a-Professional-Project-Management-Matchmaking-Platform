const Message = require('../models/Message');
const Project = require('../models/Project');
const { createNotification } = require('./notificationsController');

// GET /api/messages/:projectId
const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and user is a member/owner
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const isMember = project.members.includes(req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages for this project' });
    }
    
    const messages = await Message.find({ project: projectId })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: 1 }); // Oldest to newest
      
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
};

// POST /api/messages/:projectId
const sendMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const isMember = project.members.includes(req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages to this project' });
    }
    
    const message = new Message({
      project: projectId,
      sender: req.user.id,
      content
    });
    
    await message.save();
    await message.populate('sender', 'fullName avatar');

    // Notify other members
    const membersToNotify = [...project.members.filter(m => m.toString() !== req.user.id)];
    if (project.owner.toString() !== req.user.id && !membersToNotify.includes(project.owner)) {
      membersToNotify.push(project.owner);
    }
    
    for (const memberId of membersToNotify) {
      await createNotification({
        recipient: memberId,
        type: 'new_message',
        title: `New message in ${project.title}`,
        description: `${message.sender.fullName}: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        relatedProject: project._id,
        relatedUser: req.user.id
      });
    }
    
    // Emit event through socket via global.io (set in index.js)
    if (global.io) {
      global.io.to(projectId).emit('new_message', message);
    }
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
};

module.exports = {
  getMessages,
  sendMessage
};
