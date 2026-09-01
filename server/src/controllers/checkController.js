const mongoose = require('mongoose');
const Endpoint = require('../models/Endpoint');
const Check = require('../models/Check');
const Baseline = require('../models/Baseline');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function listChecks(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error('Invalid endpoint id.');
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });
    if (!endpoint) {
      const err = new Error('Endpoint not found.');
      err.status = 404;
      throw err;
    }

    const checks = await Check.find({ endpointId: id })
      .select('-rawResponseSample')
      .sort({ timestamp: -1 });

    res.status(200).json(checks);
  } catch (err) {
    next(err);
  }
}

async function getCheckDiff(req, res, next) {
  try {
    const { id, checkId } = req.params;

    if (!isValidId(id) || !isValidId(checkId)) {
      const err = new Error('Invalid endpoint id or check id.');
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });
    if (!endpoint) {
      const err = new Error('Endpoint not found.');
      err.status = 404;
      throw err;
    }

    const check = await Check.findOne({ _id: checkId, endpointId: id });
    if (!check) {
      const err = new Error('Check not found.');
      err.status = 404;
      throw err;
    }

    res.status(200).json(check);
  } catch (err) {
    next(err);
  }
}

async function getBaseline(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const err = new Error('Invalid endpoint id.');
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });
    if (!endpoint) {
      const err = new Error('Endpoint not found.');
      err.status = 404;
      throw err;
    }

    const baseline = await Baseline.findOne({ endpointId: id });
    if (!baseline) {
      const err = new Error('No baseline captured yet.');
      err.status = 404;
      throw err;
    }

    res.status(200).json(baseline);
  } catch (err) {
    next(err);
  }
}

module.exports = { listChecks, getCheckDiff, getBaseline };