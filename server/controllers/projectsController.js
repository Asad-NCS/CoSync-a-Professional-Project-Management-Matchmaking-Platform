const Project = require('../models/Project');
const { createNotification } = require('./notificationsController');

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const { search, category, stack, status, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (stack) {
      const stackArray = stack.split(',').map(s => s.trim());
      query.stack = { $in: stackArray };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .populate('owner', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const totalCount = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'fullName avatar skills')
      .populate('members', 'fullName avatar role');
      
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('getProjectById error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching project' });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const {
      title, tagline, category, description, problem, roles,
      teamSize, duration, difficulty, stack, stack_details,
      deadline, perks, applicationQuestion, github, figma,
      website, isRemote, isPublic, requireCoverLetter
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    
    const newProject = new Project({
      title, tagline, category, description, problem, roles,
      teamSize, duration, difficulty, stack, stack_details,
      deadline, perks, applicationQuestion, github, figma,
      website, isRemote, isPublic, requireCoverLetter,
      owner: req.user.id
    });
    
    await newProject.save();

    await createNotification({
      recipient: req.user.id,
      type: 'project_published',
      title: 'Project Published',
      description: `Your project "${title}" is now live!`,
      relatedProject: newProject._id
    });
    
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    console.error('createProject error:', error);
    res.status(500).json({ success: false, message: 'Server error creating project' });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }
    
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('updateProject error:', error);
    res.status(500).json({ success: false, message: 'Server error updating project' });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('deleteProject error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
};

// GET /api/projects/matches
// Dynamic Matchmaking Algorithm
const getMatchedProjects = async (req, res) => {
  try {
    const User = require('../models/User');
    // 1. Get the current user's skills
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userSkills = user.skills || [];

    // If user has no skills, we can't really match them effectively
    if (userSkills.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'Add skills to your profile to see matches' });
    }

    // 2. Fetch all open projects
    const projects = await Project.find({ status: 'open' })
      .populate('owner', 'fullName avatar')
      .lean();

    // 3. Calculate match score for each project
    const matchedProjects = projects.map(project => {
      let score = 0;
      let matchedSkills = [];

      // Weight logic:
      // +2 points for every user skill that matches the project's core stack
      if (project.stack && project.stack.length > 0) {
        project.stack.forEach(tech => {
          if (userSkills.some(us => us.toLowerCase() === tech.toLowerCase())) {
            score += 2;
            matchedSkills.push(tech);
          }
        });
      }

      // +1 point for every user skill that matches a specific role requirement
      if (project.roles && project.roles.length > 0) {
        project.roles.forEach(role => {
          if (role.skills && role.skills.length > 0) {
            role.skills.forEach(skill => {
              if (userSkills.some(us => us.toLowerCase() === skill.toLowerCase())) {
                if (!matchedSkills.includes(skill)) {
                  score += 1;
                  matchedSkills.push(skill);
                }
              }
            });
          }
        });
      }

      // Calculate a Match Percentage (capped at 100)
      const totalRequired = (project.stack ? project.stack.length : 0) + 
        (project.roles ? project.roles.reduce((acc, r) => acc + (r.skills ? r.skills.length : 0), 0) : 0);
      
      const matchPercentage = totalRequired > 0 ? Math.round((matchedSkills.length / totalRequired) * 100) : 0;

      return {
        ...project,
        matchScore: score,
        matchPercentage: Math.min(matchPercentage, 100),
        matchedSkills
      };
    });

    // 4. Sort by score descending and filter out projects with 0 score
    const thresholdProjects = matchedProjects
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      data: thresholdProjects,
      count: thresholdProjects.length
    });
  } catch (error) {
    console.error('getMatchedProjects error:', error);
    res.status(500).json({ success: false, message: 'Server error generating matches' });
  }
};

// PUT /api/projects/:id/complete
const completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this project' });
    }

    if (project.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Project is already completed' });
    }
    
    project.status = 'completed';
    project.completedAt = new Date();
    await project.save();

    // Increment owner's reputation
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $inc: { completedProjects: 1 } });

    // Notify all members
    const members = project.members || [];
    for (const memberId of members) {
      await createNotification({
        recipient: memberId,
        type: 'team_formed', // Using team_formed as a placeholder or could create 'project_completed'
        title: 'Project Completed! 🎉',
        description: `Congratulations! "${project.title}" has been marked as completed.`,
        relatedProject: project._id
      });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('completeProject error:', error);
    res.status(500).json({ success: false, message: 'Server error completing project' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getMatchedProjects,
  completeProject
};
