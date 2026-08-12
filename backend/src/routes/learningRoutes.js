const express = require('express');
const router = express.Router();
const {
  getLearningResources,
  getRecommendationsForUser,
  getRoadmap,
  updateRoadmapStatus
} = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.get('/', getLearningResources);
router.get('/recommendations', protect, getRecommendationsForUser);
router.get('/roadmap', protect, getRoadmap);
router.put('/roadmap/:id', protect, updateRoadmapStatus);

module.exports = router;
