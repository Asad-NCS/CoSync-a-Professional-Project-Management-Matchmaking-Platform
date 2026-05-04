const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getMessages, sendMessage } = require('../controllers/messagesController');

// All message routes are protected
router.use(verifyToken);

router.get('/:projectId', getMessages);
router.post('/:projectId', sendMessage);

module.exports = router;
