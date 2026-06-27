const JobApplication = require('../models/JobApplication');
const StartupOutreach = require('../models/StartupOutreach');
const LinkedInConnection = require('../models/LinkedInConnection');
const FollowUp = require('../models/FollowUp');

// Helper to get start and end dates of today, this week, this month
const getDateRanges = () => {
  const now = new Date();
  
  // Today range
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Week range (last 7 days or current calendar week, let's do current calendar week starting Monday)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  // Month range
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    today: { start: startOfToday, end: endOfToday },
    week: { start: startOfWeek, end: new Date() },
    month: { start: startOfMonth, end: new Date() }
  };
};

// @desc    Get dashboard summary cards and widgets
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const ranges = getDateRanges();

    // 1. Fetch counts for Today
    const appsToday = await JobApplication.countDocuments({
      user: userId,
      appliedDate: { $gte: ranges.today.start, $lte: ranges.today.end }
    });

    const outreachToday = await StartupOutreach.countDocuments({
      user: userId,
      emailSentDate: { $gte: ranges.today.start, $lte: ranges.today.end }
    });

    const connectionsToday = await LinkedInConnection.countDocuments({
      user: userId,
      connectionRequestDate: { $gte: ranges.today.start, $lte: ranges.today.end }
    });

    // 2. Fetch counts for This Week
    const appsThisWeek = await JobApplication.countDocuments({
      user: userId,
      appliedDate: { $gte: ranges.week.start, $lte: ranges.week.end }
    });

    const outreachThisWeek = await StartupOutreach.countDocuments({
      user: userId,
      emailSentDate: { $gte: ranges.week.start, $lte: ranges.week.end }
    });

    const connectionsThisWeek = await LinkedInConnection.countDocuments({
      user: userId,
      connectionRequestDate: { $gte: ranges.week.start, $lte: ranges.week.end }
    });

    // 3. Fetch counts for This Month
    const appsThisMonth = await JobApplication.countDocuments({
      user: userId,
      appliedDate: { $gte: ranges.month.start, $lte: ranges.month.end }
    });

    const outreachThisMonth = await StartupOutreach.countDocuments({
      user: userId,
      emailSentDate: { $gte: ranges.month.start, $lte: ranges.month.end }
    });

    const connectionsThisMonth = await LinkedInConnection.countDocuments({
      user: userId,
      connectionRequestDate: { $gte: ranges.month.start, $lte: ranges.month.end }
    });

    // 4. Follow-ups count
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingJobsCount = await JobApplication.countDocuments({
      user: userId,
      status: { $in: ['Applied', 'Interview Scheduled', 'Technical Round', 'HR Round'] },
      appliedDate: { $lte: fiveDaysAgo }
    });

    const pendingOutreachCount = await StartupOutreach.countDocuments({
      user: userId,
      responseStatus: 'No Response',
      emailSentDate: { $lte: sevenDaysAgo }
    });

    const pendingNetworkingCount = await LinkedInConnection.countDocuments({
      user: userId,
      accepted: false,
      connectionRequestDate: { $lte: fiveDaysAgo }
    });

    const customFollowUpsCount = await FollowUp.countDocuments({
      user: userId,
      completed: false
    });

    const totalFollowUpsDue = pendingJobsCount + pendingOutreachCount + pendingNetworkingCount + customFollowUpsCount;

    res.json({
      success: true,
      data: {
        targets: req.user.dailyTargets,
        today: {
          applications: appsToday,
          outreach: outreachToday,
          connections: connectionsToday
        },
        week: {
          applications: appsThisWeek,
          outreach: outreachThisWeek,
          connections: connectionsThisWeek
        },
        month: {
          applications: appsThisMonth,
          outreach: outreachThisMonth,
          connections: connectionsThisMonth
        },
        followUpsDue: {
          total: totalFollowUpsDue,
          applications: pendingJobsCount,
          outreach: pendingOutreachCount,
          networking: pendingNetworkingCount,
          custom: customFollowUpsCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard charts and detailed analytics
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Rates Calculation
    const totalApps = await JobApplication.countDocuments({ user: userId });
    const interviews = await JobApplication.countDocuments({
      user: userId,
      status: { $in: ['Interview Scheduled', 'Technical Round', 'HR Round', 'Offer'] }
    });
    const offers = await JobApplication.countDocuments({
      user: userId,
      status: 'Offer'
    });

    const totalOutreach = await StartupOutreach.countDocuments({ user: userId });
    const outreachResponses = await StartupOutreach.countDocuments({
      user: userId,
      responseStatus: { $in: ['Replied - Interested', 'Replied - Not Interested'] }
    });

    const totalConnections = await LinkedInConnection.countDocuments({ user: userId });
    const acceptedConnections = await LinkedInConnection.countDocuments({
      user: userId,
      accepted: true
    });

    const interviewRate = totalApps > 0 ? Math.round((interviews / totalApps) * 100) : 0;
    const responseRate = totalOutreach > 0 ? Math.round((outreachResponses / totalOutreach) * 100) : 0;
    const offerRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0;
    const networkingRate = totalConnections > 0 ? Math.round((acceptedConnections / totalConnections) * 100) : 0;

    // Daily Timeline (Last 14 days)
    const dailyTimeline = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const apps = await JobApplication.countDocuments({ user: userId, appliedDate: { $gte: start, $lte: end } });
      const outreach = await StartupOutreach.countDocuments({ user: userId, emailSentDate: { $gte: start, $lte: end } });
      const connections = await LinkedInConnection.countDocuments({ user: userId, connectionRequestDate: { $gte: start, $lte: end } });

      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailyTimeline.push({
        label: dayLabel,
        applications: apps,
        outreach: outreach,
        connections: connections
      });
    }

    // Status breakdown for applications chart
    const statuses = ['Applied', 'Interview Scheduled', 'Technical Round', 'HR Round', 'Rejected', 'Offer'];
    const statusBreakdown = {};
    for (const stat of statuses) {
      statusBreakdown[stat] = await JobApplication.countDocuments({ user: userId, status: stat });
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalApplications: totalApps,
          totalOutreach: totalOutreach,
          totalConnections: totalConnections,
          interviews,
          offers,
          interviewRate,
          responseRate,
          offerRate,
          networkingRate
        },
        dailyTimeline,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getAnalytics
};
