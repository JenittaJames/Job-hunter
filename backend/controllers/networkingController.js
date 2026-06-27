const LinkedInConnection = require('../models/LinkedInConnection');

// @desc    Get all LinkedIn connections
// @route   GET /api/networking
// @access  Private
const getConnections = async (req, res, next) => {
  try {
    const { search, accepted, followUpSent, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { personName: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (accepted !== undefined && accepted !== '') {
      query.accepted = accepted === 'true';
    }

    if (followUpSent !== undefined && followUpSent !== '') {
      query.followUpSent = followUpSent === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LinkedInConnection.countDocuments(query);
    const connections = await LinkedInConnection.find(query)
      .sort({ connectionRequestDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: connections.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: connections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single connection
// @route   GET /api/networking/:id
// @access  Private
const getConnection = async (req, res, next) => {
  try {
    const connection = await LinkedInConnection.findOne({ _id: req.params.id, user: req.user._id });

    if (!connection) {
      res.status(404);
      throw new Error('LinkedIn connection not found');
    }

    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create connection
// @route   POST /api/networking
// @access  Private
const createConnection = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const connection = await LinkedInConnection.create(req.body);

    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update connection
// @route   PUT /api/networking/:id
// @access  Private
const updateConnection = async (req, res, next) => {
  try {
    let connection = await LinkedInConnection.findOne({ _id: req.params.id, user: req.user._id });

    if (!connection) {
      res.status(404);
      throw new Error('LinkedIn connection not found');
    }

    connection = await LinkedInConnection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete connection
// @route   DELETE /api/networking/:id
// @access  Private
const deleteConnection = async (req, res, next) => {
  try {
    const connection = await LinkedInConnection.findOne({ _id: req.params.id, user: req.user._id });

    if (!connection) {
      res.status(404);
      throw new Error('LinkedIn connection not found');
    }

    await LinkedInConnection.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection
};
