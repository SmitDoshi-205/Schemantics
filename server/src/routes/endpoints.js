const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createEndpoint,
  listEndpoints,
  getEndpoint,
  deleteEndpoint,
  checkNow,
} = require('../controllers/endpointController');

const router = express.Router();

// Every route below requires a valid JWT.
router.use(protect);

router.post('/', createEndpoint);
router.post('/:id/check-now', checkNow);
router.get('/', listEndpoints);
router.get('/:id', getEndpoint);
router.delete('/:id', deleteEndpoint);

module.exports = router;