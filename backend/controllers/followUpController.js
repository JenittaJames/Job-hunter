const JobApplication = require('../models/JobApplication');
const StartupOutreach = require('../models/StartupOutreach');
const LinkedInConnection = require('../models/LinkedInConnection');
const FollowUp = require('../models/FollowUp');

// @desc    Get all follow-ups (both dynamic based on days, and custom database follow-ups)
// @route   GET /api/followups
// @access  Private
const getFollowUps = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Applications older than 5 days (Status 'Applied', 'Interview Scheduled')
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const pendingJobs = await JobApplication.find({
      user: userId,
      status: { $in: ['Applied', 'Interview Scheduled', 'Technical Round', 'HR Round'] },
      appliedDate: { $lte: fiveDaysAgo }
    });

    // 2. Startup outreach older than 7 days (Status 'No Response')
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingOutreach = await StartupOutreach.find({
      user: userId,
      responseStatus: 'No Response',
      emailSentDate: { $lte: sevenDaysAgo }
    });

    // 3. Unanswered networking requests (accepted = false)
    // Let's filter those older than 5 days or simply all unanswered requests
    const pendingNetworking = await LinkedInConnection.find({
      user: userId,
      accepted: false,
      connectionRequestDate: { $lte: fiveDaysAgo }
    });

    // 4. Custom active follow-ups from database (completed = false)
    const customFollowUps = await FollowUp.find({
      user: userId,
      completed: false
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      data: {
        jobs: pendingJobs.map(job => ({
          id: job._id,
          type: 'Application',
          title: `Follow up on ${job.jobTitle} at ${job.companyName}`,
          date: job.appliedDate,
          daysAgo: Math.floor((new Date() - new Date(job.appliedDate)) / (1000 * 60 * 60 * 24)),
          source: job
        })),
        outreach: pendingOutreach.map(out => ({
          id: out._id,
          type: 'Outreach',
          title: `Follow up with ${out.founderName || 'Founder'} from ${out.startupName}`,
          date: out.emailSentDate,
          daysAgo: Math.floor((new Date() - new Date(out.emailSentDate)) / (1000 * 60 * 60 * 24)),
          source: out
        })),
        networking: pendingNetworking.map(conn => ({
          id: conn._id,
          type: 'Networking',
          title: `Ping ${conn.personName} (${conn.designation || 'Connection'} at ${conn.company || 'Company'})`,
          date: conn.connectionRequestDate,
          daysAgo: Math.floor((new Date() - new Date(conn.connectionRequestDate)) / (1000 * 60 * 60 * 24)),
          source: conn
        })),
        custom: customFollowUps
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom follow-up
// @route   POST /api/followups
// @access  Private
const createFollowUp = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const followUp = await FollowUp.create(req.body);

    res.status(201).json({
      success: true,
      data: followUp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete or toggle a follow-up
// @route   PUT /api/followups/:id/complete
// @access  Private
const completeFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findOne({ _id: req.params.id, user: req.user._id });

    if (!followUp) {
      res.status(404);
      throw new Error('Follow-up record not found');
    }

    followUp.completed = req.body.completed !== undefined ? req.body.completed : true;
    followUp.completedAt = followUp.completed ? new Date() : null;
    await followUp.save();

    res.json({
      success: true,
      data: followUp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom follow-up
// @route   DELETE /api/followups/:id
// @access  Private
const deleteFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findOne({ _id: req.params.id, user: req.user._id });

    if (!followUp) {
      res.status(404);
      throw new Error('Follow-up record not found');
    }

    await FollowUp.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFollowUps,
  createFollowUp,
  completeFollowUp,
  deleteFollowUp
};
