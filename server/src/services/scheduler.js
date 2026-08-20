const cron = require('node-cron');
const Endpoint = require('../models/Endpoint');
const { runCheckForEndpoint } = require('./checkRunner');

function isEndpointDue(endpoint, now = Date.now()) {
  if (!endpoint.lastCheckedAt) return true;
  const dueAt = new Date(endpoint.lastCheckedAt).getTime() + endpoint.checkIntervalMinutes * 60 * 1000;
  return now >= dueAt;
}

function startScheduler() {
  cron.schedule('* * * * *', async () => {
    let endpoints;
    try {
      endpoints = await Endpoint.find({});
    } catch (err) {
      console.error('[scheduler] Failed to query endpoints:', err.message);
      return;
    }

    const now = Date.now();
    const due = endpoints.filter((ep) => isEndpointDue(ep, now));

    for (const endpoint of due) {
      try {
        await runCheckForEndpoint(endpoint);
        console.log(`[scheduler] Checked "${endpoint.name}" (${endpoint._id}) - status: ${endpoint.status}`);
      } catch (err) {
        console.error(`[scheduler] Failed to check "${endpoint.name}" (${endpoint._id}):`, err.message);
      }
    }
  });

  console.log('[scheduler] Started - checking for due endpoints every minute.');
}

module.exports = { startScheduler, isEndpointDue };