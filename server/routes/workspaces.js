const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getWorkspace,
  updateWorkspace,
  addTask
} = require('../controllers/workspaceController');

// All routes are protected
router.use(verifyToken);

router.get('/:projectId', getWorkspace);
router.put('/:projectId', updateWorkspace);
router.post('/:projectId/tasks', addTask);

module.exports = router;
