const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const { createNotification } = require('./notificationsController');

// POST /api/projects/:id/apply
const applyToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const applicantId = req.user.id;
    const { message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() === applicantId) {
      return res.status(400).json({ success: false, message: 'Cannot apply to your own project' });
    }

    const existingApp = await Application.findOne({ project: projectId, applicant: applicantId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied to this project' });
    }

    const application = new Application({
      project: projectId,
      applicant: applicantId,
      message
    });

    await application.save();

    // Create notification for the project owner
    const applicantUser = await User.findById(applicantId);
    await createNotification({
      recipient: project.owner,
      type: 'application_received',
      title: 'New Project Application',
      description: `${applicantUser.fullName} applied to your project "${project.title}"`,
      relatedProject: project._id,
      relatedUser: applicantId
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('applyToProject error:', error);
    res.status(500).json({ success: false, message: 'Server error applying to project' });
  }
};

// GET /api/projects/:id/applications
const getProjectApplications = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the project owner can view applications' });
    }

    const applications = await Application.find({ project: projectId })
      .populate('applicant', 'fullName skills bio github linkedin avatar');

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('getProjectApplications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

// PUT /api/applications/:appId
const updateApplicationStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });
    }

    const application = await Application.findById(appId).populate('project');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the project owner can update application status' });
    }

    application.status = status;
    await application.save();

    const project = await Project.findById(application.project._id);

    if (status === 'accepted') {
      if (!project.members.includes(application.applicant)) {
        project.members.push(application.applicant);
        await project.save();
      }
    }

    // Create notification for the applicant
    await createNotification({
      recipient: application.applicant,
      type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
      title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      description: `Your application to "${project.title}" was ${status}`,
      relatedProject: project._id
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
};

module.exports = {
  applyToProject,
  getProjectApplications,
  updateApplicationStatus
};
