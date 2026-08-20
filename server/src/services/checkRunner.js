const Baseline = require('../models/Baseline');
const Check = require('../models/Check');
const { performCheck } = require('./checkerService');
const { requestDiff } = require('./diffService');

const MAX_SAMPLE_LENGTH = 50000;

async function runCheckForEndpoint(endpoint) {
  const result = await performCheck(endpoint);

  let diff = null;
  let baselineCaptured = false;

  if (result.ok) {
    let baseline = await Baseline.findOne({ endpointId: endpoint._id });

    if (!baseline) {
      const initialDiff = await requestDiff({}, result.responseData);
      const schema = Object.fromEntries(initialDiff.map((d) => [d.path, d.newType]));

      baseline = await Baseline.create({
        endpointId: endpoint._id,
        schema,
        sampleResponse: safeSample(result.responseData),
      });

      endpoint.status = 'stable';
      baselineCaptured = true;
    } else {
      const rawDiff = await requestDiff(baseline.schema, result.responseData);

      if (rawDiff.length === 0) {
        endpoint.status = 'stable';
      } else {
        diff = rawDiff;
        const hasBreaking = diff.some((d) => d.severity === 'breaking');
        endpoint.status = hasBreaking ? 'broken' : 'drifted';
      }
    }
  } else {
    endpoint.status = 'broken';
  }

  endpoint.lastCheckedAt = new Date();
  await endpoint.save();

  const check = await Check.create({
    endpointId: endpoint._id,
    timestamp: endpoint.lastCheckedAt,
    httpStatus: result.httpStatus,
    responseTimeMs: result.responseTimeMs,
    rawResponseSample: result.responseSample,
    ok: result.ok,
    error: result.error,
    diffResult: diff,
  });

  return { check, diff, baselineCaptured, result };
}

function safeSample(data) {
  try {
    const serialized = JSON.stringify(data);
    if (serialized && serialized.length > MAX_SAMPLE_LENGTH) {
      return { note: 'Response too large to store as a full sample.' };
    }
    return data;
  } catch (e) {
    return null;
  }
}

module.exports = { runCheckForEndpoint };