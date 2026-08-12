const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    matchPercentage: { type: Number, required: true },
    scores: {
      skillScore: Number,
      experienceScore: Number,
      educationScore: Number,
      interestScore: Number,
      locationScore: Number,
      certScore: Number
    },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    explanation: { type: mongoose.Schema.Types.Mixed },
    weightsUsed: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);
