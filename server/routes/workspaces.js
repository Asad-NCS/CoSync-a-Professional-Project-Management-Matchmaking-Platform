const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getWorkspace,
  updateWorkspace,
  addTask,
  getActivity
} = require('../controllers/workspaceController');

// All routes are protected
router.use(verifyToken);

router.get('/:projectId', getWorkspace);
router.put('/:projectId', updateWorkspace);
router.post('/:projectId/tasks', addTask);
// Activity feed — project-scoped notifications + task state
router.get('/:projectId/activity', getActivity);

module.exports = router;
