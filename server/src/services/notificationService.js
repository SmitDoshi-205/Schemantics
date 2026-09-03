const SibApiV3Sdk = require('sib-api-v3-sdk');
const axios = require('axios');

let cachedClient = null;

function getBrevoClient() {
  if (cachedClient) return cachedClient;
  const { BREVO_API_KEY } = process.env;
  if (!BREVO_API_KEY) return null;

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  defaultClient.authentications['api-key'].apiKey = BREVO_API_KEY;
  cachedClient = new SibApiV3Sdk.TransactionalEmailsApi();
  return cachedClient;
}

function buildAlertText(endpointName, status, diff) {
  const lines = [`Schemantics detected a change in "${endpointName}".`, `Status: ${status}`, '', 'Changes:'];
  for (const d of diff || []) {
    lines.push(`- [${d.severity}] ${d.path}: ${d.changeType} (${d.oldType ?? 'n/a'} -> ${d.newType ?? 'n/a'})`);
  }
  return lines.join('\n');
}

async function sendEmailAlert({ to, endpointName, status, diff }) {
  const client = getBrevoClient();
  if (!client) {
    console.warn('[notifications] Email not configured (BREVO_API_KEY missing) - skipping.');
    return { sent: false, reason: 'not_configured' };
  }

  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = { email: process.env.ALERT_FROM_EMAIL, name: 'Schemantics' };
  email.to = [{ email: to }];
  email.subject = `Schemantics alert: ${endpointName} is ${status}`;
  email.textContent = buildAlertText(endpointName, status, diff);

  try {
    await client.sendTransacEmail(email);
    return { sent: true };
  } catch (err) {
    const msg = err.response?.text || err.message;
    console.error('[notifications] Failed to send email alert:', msg);
    return { sent: false, reason: msg };
  }
}

async function sendWebhookAlert({ webhookUrl, endpointName, status, diff }) {
  if (!webhookUrl) return { sent: false, reason: 'not_configured' };
  const payload = { content: buildAlertText(endpointName, status, diff), endpointName, status, diff };
  try {
    await axios.post(webhookUrl, payload, { timeout: 10000 });
    return { sent: true };
  } catch (err) {
    console.error('[notifications] Failed to send webhook alert:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendEmailAlert, sendWebhookAlert, buildAlertText };