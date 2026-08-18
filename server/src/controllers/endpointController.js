const mongoose = require('mongoose');
const Endpoint = require('../models/Endpoint');
const { validateEndpointInput } = require('../utils/validateEndpointInput');
const { performCheck } = require('../services/checkerService');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createEndpoint(req, res, next) {
  try {
    const errors = validateEndpointInput(req.body);
    if (errors.length > 0) {
      const err = new Error(errors.join(' '));
      err.status = 400;
      throw err;
    }

    const { name, url, method, headers, checkIntervalMinutes } = req.body;

    const endpoint = await Endpoint.create({
      userId: req.user._id,
      name: name.trim(),
      url: url.trim(),
      method: method ? method.toUpperCase() : undefined,
      headers: headers || {},
      checkIntervalMinutes: checkIntervalMinutes || undefined,
    });

    res.status(201).json(endpoint);
  } catch (err) {
    next(err);
  }
}

async function listEndpoints(req, res, next) {
  try {
    const endpoints = await Endpoint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(endpoints);
  } catch (err) {
    next(err);
  }
}

async function getEndpoint(req, res, next) {
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

    res.status(200).json(endpoint);
  } catch (err) {
    next(err);
  }
}

async function deleteEndpoint(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error('Invalid endpoint id.');
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!endpoint) {
      const err = new Error('Endpoint not found.');
      err.status = 404;
      throw err;
    }

    res.status(200).json({ message: 'Endpoint deleted.', id });
  } catch (err) {
    next(err);
  }
}

async function checkNow(req, res, next) {
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

    const result = await performCheck(endpoint);

    endpoint.lastCheckedAt = new Date();
    await endpoint.save();

    res.status(200).json({
      endpointId: endpoint._id,
      checkedAt: endpoint.lastCheckedAt,
      ok: result.ok,
      httpStatus: result.httpStatus,
      responseTimeMs: result.responseTimeMs,
      responseData: result.responseData,
      error: result.error,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEndpoint, listEndpoints, getEndpoint, deleteEndpoint, checkNow };