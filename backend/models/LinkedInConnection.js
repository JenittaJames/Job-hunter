const mongoose = require('mongoose');

const LinkedInConnectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personName: {
      type: String,
      required: [true, 'Please add a person name'],
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    linkedinProfile: {
      type: String,
      required: [true, 'Please add a LinkedIn profile link'],
      trim: true
    },
    connectionRequestDate: {
      type: Date,
      default: Date.now
    },
    accepted: {
      type: Boolean,
      default: false
    },
    followUpSent: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model('LinkedInConnection', LinkedInConnectionSchema);
