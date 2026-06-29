const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      };
      
      res.cookie('jwt', accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('jwt_refresh', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          dailyTargets: user.dailyTargets
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      };
      
      res.cookie('jwt', accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('jwt_refresh', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          dailyTargets: user.dailyTargets
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.jwt_refresh;

    if (!refreshToken) {
      res.status(401);
      throw new Error('No refresh token provided');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    };
    
    res.cookie('jwt', accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('jwt_refresh', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily targets
// @route   PUT /api/auth/targets
// @access  Private
const updateTargets = async (req, res, next) => {
  try {
    const { applications, outreach, connections } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (applications !== undefined) user.dailyTargets.applications = applications;
    if (outreach !== undefined) user.dailyTargets.outreach = outreach;
    if (connections !== undefined) user.dailyTargets.connections = connections;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dailyTargets: user.dailyTargets
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    };
    
    res.cookie('jwt', '', { ...cookieOptions, expires: new Date(0) });
    res.cookie('jwt_refresh', '', { ...cookieOptions, expires: new Date(0) });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  updateTargets,
  logoutUser
};
