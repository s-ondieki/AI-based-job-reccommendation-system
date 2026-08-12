const express = require('express');
const router = express.Router();
const {
  getStatistics,
  getUsers,
  updateUserRole,
  deleteUser,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getModelAnalytics
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/statistics', getStatistics);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

router.post('/learning', createLearningResource);
router.put('/learning/:id', updateLearningResource);
router.delete('/learning/:id', deleteLearningResource);

router.get('/analytics', getModelAnalytics);

module.exports = router;
