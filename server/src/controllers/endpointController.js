const mongoose = require("mongoose");
const Endpoint = require("../models/Endpoint");
const Baseline = require("../models/Baseline");

const { validateEndpointInput } = require("../utils/validateEndpointInput");
const { runCheckForEndpoint } = require("../services/checkRunner");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createEndpoint(req, res, next) {
  try {
    const errors = validateEndpointInput(req.body);
    if (errors.length > 0) {
      const err = new Error(errors.join(" "));
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
    await runCheckForEndpoint(endpoint);
    res.status(201).json(endpoint);
  } catch (err) {
    next(err);
  }
}

async function listEndpoints(req, res, next) {
  try {
    const endpoints = await Endpoint.find({ userId: req.user._id }).sort({
      createdAt: 1, _id: 1
    });
    res.status(200).json(endpoints);
  } catch (err) {
    next(err);
  }
}

async function getEndpoint(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error("Invalid endpoint id.");
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });

    if (!endpoint) {
      const err = new Error("Endpoint not found.");
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
      const err = new Error("Invalid endpoint id.");
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!endpoint) {
      const err = new Error("Endpoint not found.");
      err.status = 404;
      throw err;
    }

    res.status(200).json({ message: "Endpoint deleted.", id });
  } catch (err) {
    next(err);
  }
}

async function checkNow(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error("Invalid endpoint id.");
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });

    if (!endpoint) {
      const err = new Error("Endpoint not found.");
      err.status = 404;
      throw err;
    }

    const { check, diff, baselineCaptured, result } =
      await runCheckForEndpoint(endpoint);

    res.status(200).json({
      endpointId: endpoint._id,
      checkId: check._id,
      checkedAt: check.timestamp,
      ok: result.ok,
      httpStatus: result.httpStatus,
      responseTimeMs: result.responseTimeMs,
      responseData: result.responseData,
      error: result.error,
      status: endpoint.status,
      baselineCaptured,
      diff,
    });
  } catch (err) {
    next(err);
  }
}

async function updateEndpoint(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const err = new Error("Invalid endpoint id.");
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });
    if (!endpoint) {
      const err = new Error("Endpoint not found.");
      err.status = 404;
      throw err;
    }

    const { name, checkIntervalMinutes } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        const err = new Error("name must be a non-empty string.");
        err.status = 400;
        throw err;
      }
      endpoint.name = name.trim();
    }

    if (checkIntervalMinutes !== undefined) {
      if (
        typeof checkIntervalMinutes !== "number" ||
        !Number.isFinite(checkIntervalMinutes) ||
        checkIntervalMinutes < 1
      ) {
        const err = new Error("checkIntervalMinutes must be a number >= 1.");
        err.status = 400;
        throw err;
      }
      endpoint.checkIntervalMinutes = checkIntervalMinutes;
    }

    await endpoint.save();
    res.status(200).json(endpoint);
  } catch (err) {
    next(err);
  }
}

async function resetBaseline(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const err = new Error("Invalid endpoint id.");
      err.status = 400;
      throw err;
    }

    const endpoint = await Endpoint.findOne({ _id: id, userId: req.user._id });
    if (!endpoint) {
      const err = new Error("Endpoint not found.");
      err.status = 404;
      throw err;
    }

    await Baseline.deleteOne({ endpointId: endpoint._id });
    endpoint.status = "pending_baseline";
    await endpoint.save();

    const { baselineCaptured } = await runCheckForEndpoint(endpoint);

    res.status(200).json({ endpoint, baselineCaptured });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEndpoint,
  listEndpoints,
  getEndpoint,
  deleteEndpoint,
  checkNow,
  updateEndpoint,
  resetBaseline,
};