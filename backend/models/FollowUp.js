const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['Application', 'Outreach', 'Networking', 'Custom'],
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false // Optional for 'Custom' type
    },
    title: {
      type: String,
      required: [true, 'Please add a follow-up title'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FollowUp', FollowUpSchema);
