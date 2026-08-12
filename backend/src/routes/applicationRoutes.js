const express = require('express');
const router = express.Router();
const {
  getApplications,
  createOrUpdateApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getApplications);
router.post('/', protect, createOrUpdateApplication);
router.put('/:id', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
