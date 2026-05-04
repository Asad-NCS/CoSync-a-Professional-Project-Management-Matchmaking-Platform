const express = require('express');
const router = express.Router({ mergeParams: true });
const { getResources, addResource, deleteResource } = require('../controllers/resourcesController');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.use(auth);

router.route('/')
  .get(getResources)
  .post(upload.single('file'), addResource);

router.route('/:id')
  .delete(deleteResource);

module.exports = router;
