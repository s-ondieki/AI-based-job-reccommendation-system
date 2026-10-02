const User = require('../models/User');
const Job = require('../models/Job');
const Skill = require('../models/Skill');
const LearningResource = require('../models/LearningResource');
const Recommendation = require('../models/Recommendation');
const Application = require('../models/Application');
const { getEvaluationFromAI } = require('../services/aiClientService');
const { getProviderStatus } = require('../services/aiProviderService');

const getAiProviderStatus = (req, res) => {
  res.json({ success: true, providers: getProviderStatus() });
};

const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'seeker' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalJobs = await Job.countDocuments({});
    const totalSkills = await Skill.countDocuments({});
    const totalResources = await LearningResource.countDocuments({});
    const totalRecommendations = await Recommendation.countDocuments({});
    const totalApplications = await Application.countDocuments({});

    const jobs = await Job.find({ status: 'Active' });
    const skillCounts = {};
    jobs.forEach(job => {
      job.requiredSkills.forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    const topRequestedSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalJobs,
        totalSkills,
        totalResources,
        totalRecommendations,
        totalApplications,
        topRequestedSkills
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin statistics', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users list', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['seeker', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({}).sort({ category: 1, name: 1 });
    res.json({ success: true, count: skills.length, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch skills dictionary', error: error.message });
  }
};

const createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, message: 'Skill created successfully', skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create skill', error: error.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Skill updated successfully', skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skill', error: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill', error: error.message });
  }
};

const createLearningResource = async (req, res) => {
  try {
    const resource = await LearningResource.create(req.body);
    res.status(201).json({ success: true, message: 'Learning resource created', resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create resource', error: error.message });
  }
};

const updateLearningResource = async (req, res) => {
  try {
    const resource = await LearningResource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Learning resource updated', resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update resource', error: error.message });
  }
};

const deleteLearningResource = async (req, res) => {
  try {
    await LearningResource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Learning resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resource', error: error.message });
  }
};

const getModelAnalytics = async (req, res) => {
  try {
    const users = await User.find({ role: 'seeker' }).limit(5);
    const jobs = await Job.find({ status: 'Active' }).limit(10);

    const testProfiles = users.map(u => ({
      skills: (u.profile?.skills || []).map(s => ({ name: s.name })),
      totalExperienceYears: 2,
      education: u.profile?.education || []
    }));

    const testJobs = jobs.map(j => ({
      id: j._id.toString(),
      title: j.title,
      company: j.company,
      requiredSkills: j.requiredSkills,
      experienceRequired: j.experienceRequired
    }));

    const evaluation = await getEvaluationFromAI(testProfiles, testJobs);
    res.json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate model analytics', error: error.message });
  }
};

module.exports = {
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
  getModelAnalytics,
  getAiProviderStatus
};
