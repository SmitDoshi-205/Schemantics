const axios = require('axios');

const MAX_SAMPLE_LENGTH = 50000; // characters

async function performCheck(endpoint) {
  const { url, method, headers } = endpoint;
  const startedAt = Date.now();

  try {
    const response = await axios.request({
      url,
      method: method || 'GET',
      headers: headers || {},
      timeout: 10000,
      validateStatus: () => true, // never throw on HTTP error status codes
    });

    return {
      ok: true,
      httpStatus: response.status,
      responseTimeMs: Date.now() - startedAt,
      responseData: response.data,
      responseSample: truncateForStorage(response.data),
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: null,
      responseTimeMs: Date.now() - startedAt,
      responseData: null,
      responseSample: null,
      error: describeError(err),
    };
  }
}

function truncateForStorage(data) {
  let serialized;
  try {
    serialized = typeof data === 'string' ? data : JSON.stringify(data);
  } catch (e) {
    return '[response body could not be serialized]';
  }

  if (serialized.length > MAX_SAMPLE_LENGTH) {
    return `${serialized.slice(0, MAX_SAMPLE_LENGTH)}... [truncated]`;
  }
  return serialized;
}

function describeError(err) {
  if (err.code === 'ECONNABORTED') return 'Request timed out.';
  if (err.code === 'ENOTFOUND') return 'Could not resolve host - check the URL.';
  if (err.code === 'ECONNREFUSED') return 'Connection refused by the target server.';
  return err.message || 'Unknown network error.';
}

module.exports = { performCheck };