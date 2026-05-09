const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Helper function to check if user has access to project
const checkAccess = async (projectId, userId) => {
  console.log(`Checking access: project=${projectId}, user=${userId}`);
  const project = await Project.findById(projectId);
  if (!project) {
    console.log(`Access Denied: Project ${projectId} not found`);
    return { error: 'Project not found', status: 404 };
  }
  
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some(memberId => memberId.toString() === userId);
  
  console.log(`Access result: isOwner=${isOwner}, isMember=${isMember}`);

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
      console.log(`Workspace not found for project ${projectId}. Creating auto-workspace...`);
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
      console.log(`Workspace created successfully: ${workspace._id}`);
    } else {
      console.log(`Found existing workspace: ${workspace._id}`);
    }

    await workspace.populate([
      { path: 'project', select: 'title owner status deadline members', populate: { path: 'members', select: 'fullName avatar role' } },
      { path: 'columns.tasks.assignee', select: 'fullName avatar' }
    ]);

    if (!workspace.project) {
      console.error(`CRITICAL: Workspace ${workspace._id} project population failed. Project ID: ${projectId}`);
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

// GET /api/workspaces/:projectId/activity
// Returns project-scoped notifications + derived task activity for the ActivityTab
const getActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const access = await checkAccess(projectId, userId);
    if (access.error) return res.status(access.status).json({ success: false, message: access.error });

    const project = access.project;

    // 1. Fetch all notifications related to this project (for all members)
    //    These include: application_received, application_accepted, application_rejected,
    //    new_message, team_formed, project_published, deadline_reminder
    const allMemberIds = [project.owner, ...project.members];
    const notifications = await Notification.find({
      relatedProject: projectId,
      recipient: { $in: allMemberIds }
    })
      .populate('relatedUser', 'fullName')
      .sort({ createdAt: -1 })
      .limit(50);

    // Deduplicate notifications by type + relatedUser + description (multiple recipients get the same event)
    const seen = new Set();
    const deduped = notifications.filter(n => {
      const key = `${n.type}-${n.relatedUser?._id || ''}-${n.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 2. Fetch workspace for task data
    const workspace = await Workspace.findOne({ project: projectId })
      .populate({ path: 'columns.tasks.assignee', select: 'fullName' });

    // Build task activity items from current workspace state
    const taskItems = [];
    if (workspace) {
      workspace.columns.forEach(col => {
        col.tasks?.forEach(task => {
          taskItems.push({
            _id: `task-${task.id || task._id}`,
            type: 'task',
            taskTitle: task.title,
            columnTitle: col.title,
            assignee: task.assignee,
            priority: task.priority,
            isDone: col.title?.toLowerCase().includes('done'),
            createdAt: workspace.updatedAt || new Date()
          });
        });
      });
    }

    res.status(200).json({
      success: true,
      data: {
        notifications: deduped,
        tasks: taskItems,
        memberCount: project.members.length
      }
    });
  } catch (error) {
    console.error('getActivity error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching activity' });
  }
};

module.exports = {
  getWorkspace,
  updateWorkspace,
  addTask,
  getActivity
};
