const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true },
    skill: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    description: { type: String, default: '' },
    duration: { type: String, default: '5 hours' },
    url: { type: String, required: true },
    type: { type: String, enum: ['Course', 'Tutorial', 'Certification', 'Book'], default: 'Course' },
    category: { type: String, default: 'General' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningResource', LearningResourceSchema);
