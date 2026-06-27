const mongoose = require('mongoose');

const StartupOutreachSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startupName: {
      type: String,
      required: [true, 'Please add a startup name'],
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    founderName: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      required: [true, 'Please add a contact email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ],
      trim: true,
      lowercase: true
    },
    emailSentDate: {
      type: Date,
      default: Date.now
    },
    followUpDate: {
      type: Date
    },
    responseStatus: {
      type: String,
      enum: ['No Response', 'Replied - Interested', 'Replied - Not Interested'],
      default: 'No Response'
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

module.exports = mongoose.model('StartupOutreach', StartupOutreachSchema);
