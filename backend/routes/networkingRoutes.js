const express = require('express');
const router = express.Router();
const {
  getConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection
} = require('../controllers/networkingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getConnections)
  .post(createConnection);

router.route('/:id')
  .get(getConnection)
  .put(updateConnection)
  .delete(deleteConnection);

module.exports = router;
