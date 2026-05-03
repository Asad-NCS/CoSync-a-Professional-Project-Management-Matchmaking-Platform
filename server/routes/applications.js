const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { updateApplicationStatus } = require('../controllers/applicationsController');

router.put('/:appId', verifyToken, updateApplicationStatus);

module.exports = router;
