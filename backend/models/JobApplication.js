const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true
    },
    jobTitle: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true
    },
    jobUrl: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    salary: {
      type: String,
      trim: true
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    applicationSource: {
      type: String,
      default: 'LinkedIn',
      trim: true
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview Scheduled', 'Technical Round', 'HR Round', 'Rejected', 'Offer'],
      default: 'Applied'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
