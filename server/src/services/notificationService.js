const { Resend } = require('resend');
const axios = require('axios');

let cachedResendClient = null;

function getResendClient() {
  if (cachedResendClient) return cachedResendClient;

  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) {
    return null;
  }

  cachedResendClient = new Resend(RESEND_API_KEY);
  return cachedResendClient;
}

function buildAlertText(endpointName, status, diff) {
  const lines = [
    `Schemantics detected a change in "${endpointName}".`,
    `Status: ${status}`,
    '',
    'Changes:',
  ];

  for (const d of diff || []) {
    lines.push(`- [${d.severity}] ${d.path}: ${d.changeType} (${d.oldType ?? 'n/a'} -> ${d.newType ?? 'n/a'})`);
  }

  return lines.join('\n');
}

async function sendEmailAlert({ to, endpointName, status, diff }) {
  const resend = getResendClient();

  if (!resend) {
    console.warn('[notifications] Email not configured (RESEND_API_KEY missing) - skipping.');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.ALERT_FROM_EMAIL || 'Schemantics <onboarding@resend.dev>',
      to,
      subject: `Schemantics alert: ${endpointName} is ${status}`,
      text: buildAlertText(endpointName, status, diff),
    });

    if (error) {
      console.error('[notifications] Resend API returned an error:', error.message);
      return { sent: false, reason: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    console.error('[notifications] Failed to send email alert:', err.message);
    return { sent: false, reason: err.message };
  }
}

async function sendWebhookAlert({ webhookUrl, endpointName, status, diff }) {
  if (!webhookUrl) {
    return { sent: false, reason: 'not_configured' };
  }

  const payload = {
    content: buildAlertText(endpointName, status, diff),
    endpointName,
    status,
    diff,
  };

  try {
    await axios.post(webhookUrl, payload, { timeout: 10000 });
    return { sent: true };
  } catch (err) {
    console.error('[notifications] Failed to send webhook alert:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendEmailAlert, sendWebhookAlert, buildAlertText };