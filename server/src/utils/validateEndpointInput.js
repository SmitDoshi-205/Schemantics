const { ALLOWED_METHODS } = require('../models/Endpoint');

function validateEndpointInput(body) {
  const errors = [];
  const { name, url, method, checkIntervalMinutes, headers } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('name is required and must be a non-empty string.');
  }

  if (!url || typeof url !== 'string') {
    errors.push('url is required and must be a string.');
  } else {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push('url must use http or https.');
      }
    } catch (e) {
      errors.push('url is not a valid URL (include the protocol, e.g. https://...).');
    }
  }

  if (method !== undefined) {
    if (typeof method !== 'string' || !ALLOWED_METHODS.includes(method.toUpperCase())) {
      errors.push(`method must be one of: ${ALLOWED_METHODS.join(', ')}.`);
    }
  }

  if (checkIntervalMinutes !== undefined) {
    if (
      typeof checkIntervalMinutes !== 'number' ||
      !Number.isFinite(checkIntervalMinutes) ||
      checkIntervalMinutes < 1
    ) {
      errors.push('checkIntervalMinutes must be a number >= 1.');
    }
  }

  if (headers !== undefined) {
    if (typeof headers !== 'object' || headers === null || Array.isArray(headers)) {
      errors.push('headers must be a plain object of string key/value pairs.');
    } else {
      const badKey = Object.entries(headers).find(
        ([k, v]) => typeof k !== 'string' || typeof v !== 'string'
      );
      if (badKey) {
        errors.push('headers must only contain string keys and string values.');
      }
    }
  }

  return errors;
}

module.exports = { validateEndpointInput };