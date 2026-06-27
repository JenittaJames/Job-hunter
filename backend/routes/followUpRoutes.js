const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  createFollowUp,
  completeFollowUp,
  deleteFollowUp
} = require('../controllers/followUpController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id/complete')
  .put(completeFollowUp);

router.route('/:id')
  .delete(deleteFollowUp);

module.exports = router;
