const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createEndpoint,
  listEndpoints,
  getEndpoint,
  deleteEndpoint,
  checkNow,
} = require('../controllers/endpointController');
const { listChecks, getCheckDiff } = require('../controllers/checkController');

const router = express.Router();

// Every route below requires a valid JWT.
router.use(protect);

router.post('/', createEndpoint);
router.post('/:id/check-now', checkNow);
router.get('/', listEndpoints);
router.get('/:id', getEndpoint);
router.get('/:id/checks', listChecks);
router.get('/:id/diff/:checkId', getCheckDiff);
router.delete('/:id', deleteEndpoint);

module.exports = router;