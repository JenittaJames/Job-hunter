const StartupOutreach = require('../models/StartupOutreach');

// @desc    Get all outreach emails
// @route   GET /api/outreach
// @access  Private
const getOutreaches = async (req, res, next) => {
  try {
    const { search, responseStatus, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { startupName: { $regex: search, $options: 'i' } },
        { founderName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (responseStatus) {
      query.responseStatus = responseStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await StartupOutreach.countDocuments(query);
    const outreaches = await StartupOutreach.find(query)
      .sort({ emailSentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: outreaches.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: outreaches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single outreach email
// @route   GET /api/outreach/:id
// @access  Private
const getOutreach = async (req, res, next) => {
  try {
    const outreach = await StartupOutreach.findOne({ _id: req.params.id, user: req.user._id });

    if (!outreach) {
      res.status(404);
      throw new Error('Outreach record not found');
    }

    res.json({
      success: true,
      data: outreach
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create outreach email
// @route   POST /api/outreach
// @access  Private
const createOutreach = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const outreach = await StartupOutreach.create(req.body);

    res.status(201).json({
      success: true,
      data: outreach
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update outreach email
// @route   PUT /api/outreach/:id
// @access  Private
const updateOutreach = async (req, res, next) => {
  try {
    let outreach = await StartupOutreach.findOne({ _id: req.params.id, user: req.user._id });

    if (!outreach) {
      res.status(404);
      throw new Error('Outreach record not found');
    }

    outreach = await StartupOutreach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: outreach
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete outreach email
// @route   DELETE /api/outreach/:id
// @access  Private
const deleteOutreach = async (req, res, next) => {
  try {
    const outreach = await StartupOutreach.findOne({ _id: req.params.id, user: req.user._id });

    if (!outreach) {
      res.status(404);
      throw new Error('Outreach record not found');
    }

    await StartupOutreach.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOutreaches,
  getOutreach,
  createOutreach,
  updateOutreach,
  deleteOutreach
};
