const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectsController');
const {
  applyToProject,
  getProjectApplications
} = require('../controllers/applicationsController');

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected routes
router.post('/', verifyToken, createProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

// Application routes
router.post('/:id/apply', verifyToken, applyToProject);
router.get('/:id/applications', verifyToken, getProjectApplications);

module.exports = router;
