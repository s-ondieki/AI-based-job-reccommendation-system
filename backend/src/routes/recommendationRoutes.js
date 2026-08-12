const express = require('express');
const router = express.Router();
const {
  generateRecommendations,
  getSkillGapForJob,
  getCareerReadiness,
  getRecommendationHistory
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateRecommendations);
router.get('/skill-gap/:jobId', protect, getSkillGapForJob);
router.get('/career-readiness', protect, getCareerReadiness);
router.get('/history', protect, getRecommendationHistory);

module.exports = router;
