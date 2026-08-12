const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    location: { type: String, required: true },
    employmentType: { 
      type: String, 
      enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'], 
      default: 'Full-time' 
    },
    industry: { type: String, required: true },
    salaryRange: { type: String, default: 'Negotiable' },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    qualifications: [{ type: String }],
    requiredSkills: [{ type: String, required: true }],
    preferredSkills: [{ type: String }],
    educationRequirements: { type: String, default: 'BSc Information Technology or equivalent' },
    experienceRequired: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Closed', 'Draft'], default: 'Active' },
    datePosted: { type: Date, default: Date.now },
    applicationDeadline: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
