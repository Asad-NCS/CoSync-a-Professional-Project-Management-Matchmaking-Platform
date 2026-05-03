const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

// Helper function to check if user has access to project
const checkAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some(memberId => memberId.toString() === userId);
  
  if (!isOwner && !isMember) {
    return { error: 'Not authorized to access this workspace', status: 403 };
  }
  
  return { project };
};

// GET /api/workspaces/:projectId
const getWorkspace = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const access = await checkAccess(projectId, userId);
    if (access.error) return res.status(access.status).json({ success: false, message: access.error });

    let workspace = await Workspace.findOne({ project: projectId })
      .populate({
        path: 'columns.tasks.assignee',
        select: 'fullName avatar'
      });

    if (!workspace) {
      // Auto-create workspace if it doesn't exist
      workspace = new Workspace({
        project: projectId,
        columns: [
          { id: 'col-1', title: 'To Do', tasks: [] },
          { id: 'col-2', title: 'In Progress', tasks: [] },
          { id: 'col-3', title: 'Done', tasks: [] }
        ]
      });
      await workspace.save();
    }

    res.status(200).json({ success: true, data: workspace });
  } catch (error) {
    console.error('getWorkspace error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching workspace' });
  }
};

// PUT /api/workspaces/:projectId
const updateWorkspace = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { columns } = req.body;
    const userId = req.user.id;

    const access = await checkAccess(projectId, userId);
    if (access.error) return res.status(access.status).json({ success: false, message: access.error });

    const workspace = await Workspace.findOneAndUpdate(
      { project: projectId },
      { $set: { columns } },
      { new: true, runValidators: true }
    ).populate({
      path: 'columns.tasks.assignee',
      select: 'fullName avatar'
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    res.status(200).json({ success: true, data: workspace });
  } catch (error) {
    console.error('updateWorkspace error:', error);
    res.status(500).json({ success: false, message: 'Server error updating workspace' });
  }
};

// POST /api/workspaces/:projectId/tasks
const addTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { columnId, title, description, assignee, priority } = req.body;
    const userId = req.user.id;

    const access = await checkAccess(projectId, userId);
    if (access.error) return res.status(access.status).json({ success: false, message: access.error });

    if (!columnId || !title) {
      return res.status(400).json({ success: false, message: 'columnId and title are required' });
    }

    const workspace = await Workspace.findOne({ project: projectId });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const columnIndex = workspace.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    const newTask = {
      id: `task-${Date.now().toString()}`,
      title,
      description,
      assignee,
      priority
    };

    workspace.columns[columnIndex].tasks.push(newTask);
    await workspace.save();

    // Populate the newly saved workspace to return assignee details
    await workspace.populate({
      path: 'columns.tasks.assignee',
      select: 'fullName avatar'
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    console.error('addTask error:', error);
    res.status(500).json({ success: false, message: 'Server error adding task' });
  }
};

module.exports = {
  getWorkspace,
  updateWorkspace,
  addTask
};
