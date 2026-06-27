const express = require('express');
const router = express.Router();
const {
  getOutreaches,
  getOutreach,
  createOutreach,
  updateOutreach,
  deleteOutreach
} = require('../controllers/outreachController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getOutreaches)
  .post(createOutreach);

router.route('/:id')
  .get(getOutreach)
  .put(updateOutreach)
  .delete(deleteOutreach);

module.exports = router;
