const mongoose = require('mongoose');

const RoadmapItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true },
    stepOrder: { type: Number, default: 1 },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    resourceTitle: { type: String, default: '' },
    resourceUrl: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Completed'], 
      default: 'Not Started' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoadmapItem', RoadmapItemSchema);
