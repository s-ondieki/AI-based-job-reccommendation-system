const Application = require('../models/Application');

const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('job')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
};

const createOrUpdateApplication = async (req, res) => {
  try {
    const { jobId, status, notes } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    let application = await Application.findOne({ user: req.user._id, job: jobId });

    if (application) {
      if (status) application.status = status;
      if (notes !== undefined) application.notes = notes;
      application.updatedAt = Date.now();
      await application.save();
    } else {
      application = await Application.create({
        user: req.user._id,
        job: jobId,
        status: status || 'Saved',
        notes: notes || ''
      });
    }

    const populated = await Application.findById(application._id).populate('job');
    res.status(200).json({ success: true, message: 'Application updated successfully', application: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save application status', error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findOne({ _id: id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    application.updatedAt = Date.now();

    await application.save();
    const updated = await Application.findById(application._id).populate('job');
    res.json({ success: true, message: 'Application status updated', application: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application', error: error.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Application.findOneAndDelete({ _id: id, user: req.user._id });
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }
    res.json({ success: true, message: 'Application removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete application', error: error.message });
  }
};

module.exports = {
  getApplications,
  createOrUpdateApplication,
  updateApplicationStatus,
  deleteApplication
};
