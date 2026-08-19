const axios = require('axios');

const DIFF_SERVICE_URL = process.env.DIFF_SERVICE_URL || 'http://localhost:8000';

async function requestDiff(baselineSchema, newResponseJson) {
  const response = await axios.post(
    `${DIFF_SERVICE_URL}/diff`,
    { baselineSchema, newResponseJson },
    { timeout: 10000 }
  );
  return response.data;
}

module.exports = { requestDiff };