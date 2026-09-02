const Baseline = require('../models/Baseline');
const Check = require('../models/Check');
const User = require('../models/User');
const { performCheck } = require('./checkerService');
const { requestDiff } = require('./diffService');
const { sendEmailAlert, sendWebhookAlert } = require('./notificationService');

const MAX_SAMPLE_LENGTH = 50000;
const MAX_RESPONSE_SIZE = 2_000_000; 

async function runCheckForEndpoint(endpoint) {
  const result = await performCheck(endpoint);

  let diff = null;
  let baselineCaptured = false;
  let syntheticError = null;

  const httpError = result.ok && result.httpStatus >= 400;
  const bodyTooLarge = result.ok && result.responseSample && result.responseSample.length > MAX_RESPONSE_SIZE;

  if (result.ok && httpError) {
    endpoint.status = 'broken';
    syntheticError = `Endpoint returned HTTP ${result.httpStatus} - not diffed.`;
  } else if (result.ok && bodyTooLarge) {
    endpoint.status = 'broken';
    syntheticError = 'Response body too large to safely diff (>2MB).';
  } else if (result.ok) {
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
        await notifyUserOfDrift(endpoint, diff);
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
    error: result.error || syntheticError,
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

async function notifyUserOfDrift(endpoint, diff) {
  try {
    const user = await User.findById(endpoint.userId);
    if (!user) return;
    if (user.notifyEmail) {
      await sendEmailAlert({ to: user.email, endpointName: endpoint.name, status: endpoint.status, diff });
    }
    if (user.webhookUrl) {
      await sendWebhookAlert({ webhookUrl: user.webhookUrl, endpointName: endpoint.name, status: endpoint.status, diff });
    }
  } catch (err) {
    console.error('[notifications] Unexpected error while notifying user:', err.message);
  }
}

module.exports = { runCheckForEndpoint };