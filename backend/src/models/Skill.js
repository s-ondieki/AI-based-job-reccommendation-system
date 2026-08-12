const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'General' },
    aliases: [{ type: String }],
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', SkillSchema);
