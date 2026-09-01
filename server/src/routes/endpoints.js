const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createEndpoint,
  listEndpoints,
  getEndpoint,
  updateEndpoint,
  deleteEndpoint,
  checkNow,
  resetBaseline
} = require('../controllers/endpointController');
const { listChecks, getCheckDiff, getBaseline } = require('../controllers/checkController');

const router = express.Router();

// Every route below requires a valid JWT.
router.use(protect);

router.post('/', createEndpoint);
router.get('/', listEndpoints);
router.get('/:id', getEndpoint);
router.patch('/:id', updateEndpoint);
router.delete('/:id', deleteEndpoint);
router.post('/:id/check-now', checkNow);
router.post('/:id/reset-baseline', resetBaseline);
router.get('/:id/checks', listChecks);
router.get('/:id/diff/:checkId', getCheckDiff);
router.get('/:id/baseline', getBaseline);

module.exports = router;