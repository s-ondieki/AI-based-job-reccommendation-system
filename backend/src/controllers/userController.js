const User = require('../models/User');
const { extractTextFromResume, extractStructuredProfile } = require('../services/resumeService');
const { analyzeConfirmedCv } = require('../services/cvAnalysisService');
const Job = require('../models/Job');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, profile } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (profile) {
      user.profile = {
        ...user.profile,
        ...profile
      };
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file' });
    }

    const filePath = req.file.path;
    const rawText = await extractTextFromResume(filePath);
    const parsedData = await extractStructuredProfile(rawText);

    const relativeUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.resumeUrl = relativeUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Resume uploaded and processed successfully. Review the extracted profile before saving it.',
      stage: 'extraction_complete',
      resumeUrl: relativeUrl,
      fileName: req.file.originalname,
      parsedData
    });
  } catch (error) {
    const status = error.message.includes('meaningful text') ? 422 : 502;
    res.status(status).json({
      success: false,
      stage: 'extraction_failed',
      message: error.message || 'Error processing resume file'
    });
  }
};

const analyzeCv = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const jobs = await Job.find({ status: 'Active' }).select('requiredSkills preferredSkills').lean();
    const result = await analyzeConfirmedCv({ profile: user.profile, jobs });
    res.json({ success: true, stage: 'analysis_complete', ...result });
  } catch (error) {
    res.status(502).json({
      success: false,
      stage: 'analysis_failed',
      message: 'CV analysis could not be completed. Your confirmed profile was not changed.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  analyzeCv
};
