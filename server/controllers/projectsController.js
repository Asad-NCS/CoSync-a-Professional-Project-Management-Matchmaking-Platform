const Project = require('../models/Project');

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

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
