const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  updateTargets
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/targets', protect, updateTargets);

module.exports = router;
