const JobApplication = require('../models/JobApplication');

// @desc    Get all job applications (with search, filter, pagination)
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res, next) => {
  try {
    const { search, status, source, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    // Search query
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by source
    if (source) {
      query.applicationSource = source;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobApplication.countDocuments(query);
    const jobs = await JobApplication.find(query)
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job application
// @route   GET /api/jobs/:id
// @access  Private
const getJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
      res.status(404);
      throw new Error('Job application not found');
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job application
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const job = await JobApplication.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job application
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res, next) => {
  try {
    let job = await JobApplication.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
      res.status(404);
      throw new Error('Job application not found');
    }

    job = await JobApplication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job application
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
      res.status(404);
      throw new Error('Job application not found');
    }

    await JobApplication.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
};
