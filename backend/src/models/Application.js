const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { 
      type: String, 
      enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offered', 'Accepted'], 
      default: 'Saved' 
    },
    notes: { type: String, default: '' },
    appliedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);
