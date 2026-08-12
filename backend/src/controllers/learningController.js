const LearningResource = require('../models/LearningResource');
const RoadmapItem = require('../models/RoadmapItem');
const User = require('../models/User');
const Job = require('../models/Job');

const getLearningResources = async (req, res) => {
  try {
    const { skill, level, category } = req.query;
    let query = {};

    if (skill) {
      query.skill = { $regex: skill, $options: 'i' };
    }
    if (level) {
      query.level = level;
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const resources = await LearningResource.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch learning resources', error: error.message });
  }
};

const getRecommendationsForUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userSkills = (user.profile?.skills || []).map(s => s.name.toLowerCase());

    const jobs = await Job.find({ status: 'Active' }).limit(5);
    const missingSkillsSet = new Set();

    jobs.forEach(j => {
      j.requiredSkills.forEach(rs => {
        if (!userSkills.includes(rs.toLowerCase())) {
          missingSkillsSet.add(rs);
        }
      });
    });

    const missingSkillsList = Array.from(missingSkillsSet);
    
    let resources = [];
    if (missingSkillsList.length > 0) {
      resources = await LearningResource.find({
        skill: { $in: missingSkillsList.map(s => new RegExp(s, 'i')) }
      }).limit(15);
    }

    if (resources.length === 0) {
      resources = await LearningResource.find({}).limit(10);
    }

    res.json({
      success: true,
      missingSkills: missingSkillsList,
      count: resources.length,
      recommendations: resources
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get personalized learning recommendations', error: error.message });
  }
};

const getRoadmap = async (req, res) => {
  try {
    let items = await RoadmapItem.find({ user: req.user._id }).sort({ stepOrder: 1 });

    if (items.length === 0) {
      const user = await User.findById(req.user._id);
      const userSkills = (user.profile?.skills || []).map(s => s.name.toLowerCase());
      const desiredTitle = user.profile?.preferences?.desiredJobTitle || 'Full Stack Developer';

      const targetJob = await Job.findOne({ title: { $regex: desiredTitle, $options: 'i' } }) || await Job.findOne({});
      const reqSkills = targetJob ? targetJob.requiredSkills : ['Node.js', 'MongoDB', 'Docker', 'AWS'];
      const missing = reqSkills.filter(s => !userSkills.includes(s.toLowerCase()));

      const skillsToLearn = missing.length > 0 ? missing : ['Docker', 'AWS', 'Kubernetes'];

      const defaultRoadmap = [];
      let step = 1;

      for (const skillName of skillsToLearn) {
        const resource = await LearningResource.findOne({ skill: { $regex: skillName, $options: 'i' } });
        defaultRoadmap.push({
          user: req.user._id,
          skill: skillName,
          stepOrder: step,
          title: `Master ${skillName} Fundamentals`,
          description: `Acquire key hands-on concepts in ${skillName} to satisfy core requirements for ${desiredTitle} positions.`,
          resourceTitle: resource ? resource.title : `Complete ${skillName} Course`,
          resourceUrl: resource ? resource.url : 'https://www.coursera.org',
          status: step === 1 ? 'In Progress' : 'Not Started'
        });
        step++;
      }

      defaultRoadmap.push({
        user: req.user._id,
        skill: 'Portfolio Project',
        stepOrder: step,
        title: `Build a Full-Stack Portfolio Demonstrating ${desiredTitle} Skills`,
        description: 'Deploy a production project to GitHub showcasing microservices and cloud integrations.',
        resourceTitle: 'GitHub Portfolio Guide',
        resourceUrl: 'https://github.com',
        status: 'Not Started'
      });

      items = await RoadmapItem.insertMany(defaultRoadmap);
    }

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch career roadmap', error: error.message });
  }
};

const updateRoadmapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = await RoadmapItem.findOne({ _id: id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Roadmap step item not found' });
    }

    if (status) item.status = status;
    await item.save();

    res.json({ success: true, message: 'Roadmap item updated', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update roadmap item', error: error.message });
  }
};

module.exports = {
  getLearningResources,
  getRecommendationsForUser,
  getRoadmap,
  updateRoadmapStatus
};
