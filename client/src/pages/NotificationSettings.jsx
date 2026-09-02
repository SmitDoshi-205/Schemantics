import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { api } from '../lib/api';
import Reveal from '../components/Reveal';
import Skeleton from '../components/Skeleton';

export default function NotificationSettings() {
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .me(token)
      .then((data) => {
        setNotifyEmail(data.notifyEmail);
        setWebhookUrl(data.webhookUrl || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.updateNotifications(token, {
        notifyEmail,
        webhookUrl: webhookUrl.trim() || null,
      });
      toast.success('Notification settings saved.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-12 sm:px-10">
      <Skeleton className="mb-8 h-8 w-64" />
      <div className="glass-panel flex flex-col gap-8 p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    );
  }

  return (
    <div className="mx-auto max-w-700px px-4 py-12 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
          Back
        </button>
      </div>

      <Reveal>
        <h1 className="mb-2 font-display text-2xl font-bold text-on-surface sm:text-3xl">Notification Settings</h1>
        <p className="mb-8 font-body text-sm text-on-surface-variant">
          Choose where Breaking and Warning severity alerts get sent.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <form onSubmit={handleSave} className="glass-panel flex flex-col gap-8 p-8">
          <div className="flex items-center justify-between border-b-2 border-black pb-6">
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-on-surface">Email Alerts</h3>
              <p className="mt-1 font-body text-xs text-on-surface-variant">
                Send an email to your account address when drift is detected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifyEmail((v) => !v)}
              aria-label={notifyEmail ? 'Disable email alerts' : 'Enable email alerts'}
              className={`relative h-7 w-14 flex-none cursor-pointer rounded-full border-2 border-black transition-colors ${
                notifyEmail ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              <span
                className="absolute left-1 top-1 h-4 w-4 rounded-full border-2 border-black bg-on-surface transition-transform"
                style={{
                  transform: notifyEmail ? 'translateX(1.5rem)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="webhook" className="font-display text-[11px] uppercase tracking-0.1em text-secondary">
              Webhook URL // Optional
            </label>
            <input
              id="webhook"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="neo-input w-full px-4 py-3 font-body text-sm"
            />
            <p className="font-body text-xs text-on-surface-variant">
              A generic JSON POST is sent here too - works with Discord and Slack-compatible webhooks. Leave blank to disable.
            </p>
          </div>

          {error && (
            <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-xs text-error">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neo-button self-start px-6 py-3 font-display text-sm font-bold uppercase disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Reveal>
    </div>
  );
}