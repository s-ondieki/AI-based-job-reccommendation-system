const User = require('../models/User');
const Job = require('../models/Job');
const Recommendation = require('../models/Recommendation');
const LearningResource = require('../models/LearningResource');
const {
  getSkillGapFromAI,
  getCareerReadinessFromAI
} = require('../services/aiClientService');
const { explainRecommendation } = require('../services/aiProviderService');
const { calculateRankings, fallbackExplanation } = require('../services/rankingService');

const generateRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const jobs = await Job.find({ status: 'Active' });
    if (!jobs || jobs.length === 0) {
      return res.json({ success: true, recommendations: [], message: 'No active job listings found in database.' });
    }

    const weights = req.body.weights || {
      skillWeight: 0.40,
      experienceWeight: 0.20,
      educationWeight: 0.15,
      interestWeight: 0.10,
      locationWeight: 0.10,
      certWeight: 0.05
    };

    const rankings = calculateRankings(user, jobs, weights);

    const fullRecommendations = [];
    for (const rec of rankings) {
      const matchedJob = jobs.find(j => j._id.toString() === rec.jobId);
      if (matchedJob) {
        const resources = await LearningResource.find({ skill: { $in: rec.missingSkills } }).limit(5).lean();
        let explanation = fallbackExplanation(matchedJob, rec, resources);
        let explanationProvider = 'system-fallback';
        try {
          const explained = await explainRecommendation({ profile: user.profile, job: matchedJob, ranking: rec });
          explanation = explained.explanation;
          explanationProvider = explained.provider;
        } catch (error) {
          console.warn(`[Recommendation Explanation Warning] ${error.message}`);
        }
        fullRecommendations.push({
          ...rec,
          job: matchedJob,
          explanation,
          explanationProvider
        });

        await Recommendation.create({
          user: user._id,
          job: matchedJob._id,
          matchPercentage: rec.matchPercentage,
          scores: rec.scores,
          matchingSkills: rec.matchingSkills,
          missingSkills: rec.missingSkills,
          explanation,
          weightsUsed: weights
        }).catch(err => console.error('Recommendation cache write error:', err.message));
      }
    }

    res.json({
      success: true,
      count: fullRecommendations.length,
      recommendations: fullRecommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate recommendations', error: error.message });
  }
};

const getSkillGapForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const userSkillNames = (user.profile?.skills || []).map(s => s.name);
    const skillGapData = await getSkillGapFromAI(userSkillNames, job.requiredSkills, job.preferredSkills);

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        company: job.company
      },
      skillGap: skillGapData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to analyze skill gap', error: error.message });
  }
};

const getCareerReadiness = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userSkillNames = (user.profile?.skills || []).map(s => s.name);
    
    const allJobs = await Job.find({ status: 'Active' }).limit(10);
    let totalReq = 0;
    let totalMatch = 0;

    const uSet = new Set(userSkillNames.map(s => s.toLowerCase()));
    allJobs.forEach(job => {
      job.requiredSkills.forEach(reqS => {
        totalReq++;
        if (uSet.has(reqS.toLowerCase())) {
          totalMatch++;
        }
      });
    });

    const skillCoverage = totalReq > 0 ? (totalMatch / totalReq) * 100 : 70;
    const totalExpYears = (user.profile?.experience || []).reduce((acc, curr) => acc + (curr.years || 0), 0);
    const expMatch = totalExpYears >= 2 ? 100 : totalExpYears * 40;
    const eduMatch = (user.profile?.education || []).length > 0 ? 85 : 50;
    const certMatch = (user.profile?.certifications || []).length > 0 ? 90 : 40;
    const interestMatch = (user.profile?.preferences?.careerInterests || []).length > 0 ? 80 : 50;

    const readiness = await getCareerReadinessFromAI(skillCoverage, expMatch, eduMatch, certMatch, interestMatch);

    res.json({
      success: true,
      readiness
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate career readiness', error: error.message });
  }
};

const getRecommendationHistory = async (req, res) => {
  try {
    const history = await Recommendation.find({ user: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recommendation history', error: error.message });
  }
};

module.exports = {
  generateRecommendations,
  getSkillGapForJob,
  getCareerReadiness,
  getRecommendationHistory
};
