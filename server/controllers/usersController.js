const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, university, degree, role, skills, bio, github, linkedin, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { fullName, university, degree, role, skills, bio, github, linkedin, avatar } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// GET /api/users/projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).lean();
    
    // Populate applications for each project
    const projectsWithApplications = await Promise.all(projects.map(async (project) => {
      const applications = await Application.find({ project: project._id })
        .populate('applicant', 'fullName avatar skills bio github linkedin');
      return { ...project, applications };
    }));

    res.status(200).json({ success: true, data: projectsWithApplications });
  } catch (error) {
    console.error('getMyProjects error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user projects' });
  }
};

// GET /api/users/applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'project',
        select: 'title category stack owner',
        populate: {
          path: 'owner',
          select: 'fullName'
        }
      });
      
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('getMyApplications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user applications' });
  }
};

// GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Aggregate stats
    const projectsPosted = await Project.countDocuments({ owner: userId });
    const applicationsSubmitted = await Application.countDocuments({ applicant: userId });
    const acceptedApplications = await Application.countDocuments({ applicant: userId, status: 'accepted' });
    const activeTeams = await Project.countDocuments({ members: userId });

    // Get recent data
    const recentProjects = await Project.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentProjectsWithAppCount = await Promise.all(recentProjects.map(async (project) => {
      const applicationCount = await Application.countDocuments({ project: project._id });
      return { ...project, applicationCount };
    }));

    const recentApplications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: 'project',
        select: 'title category stack owner status',
        populate: {
          path: 'owner',
          select: 'fullName'
        }
      });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          projectsPosted,
          applicationsSubmitted,
          acceptedApplications,
          activeTeams
        },
        recentProjects: recentProjectsWithAppCount,
        recentApplications
      }
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyProjects,
  getMyApplications,
  getDashboard
};
