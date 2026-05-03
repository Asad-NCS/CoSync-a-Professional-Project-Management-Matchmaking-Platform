const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getMyProjects,
  getMyApplications,
  getDashboard
} = require('../controllers/usersController');

// All routes are protected
router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/projects', getMyProjects);
router.get('/applications', getMyApplications);
router.get('/dashboard', getDashboard);

module.exports = router;
