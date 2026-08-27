import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const INTERVAL_STEPS = [1, 5, 15, 60];
const INTERVAL_LABELS = ['1m', '5m', '15m', '1h'];

export default function AddEndpoint() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [intervalIndex, setIntervalIndex] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateHeader(index, field, value) {
    setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  }

  function addHeaderRow() {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  }

  function removeHeaderRow(index) {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const headersObject = Object.fromEntries(
      headers.filter((h) => h.key.trim() !== '').map((h) => [h.key.trim(), h.value])
    );

    try {
      await api.createEndpoint(token, {
        name,
        url,
        method,
        headers: headersObject,
        checkIntervalMinutes: INTERVAL_STEPS[intervalIndex],
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-10">
      <Link
        to="/dashboard"
        className="group mb-8 inline-flex items-center gap-2 font-body text-sm text-outline transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
          arrow_back
        </span>
        Back to Dashboard
      </Link>

      <div className="glass-panel relative overflow-hidden p-8">
        <div className="mb-10 flex items-end justify-between border-b-2 border-outline-variant pb-6">
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold text-on-surface">Initialize Monitoring</h1>
            <p className="font-body text-sm text-on-surface-variant">Configure a target for contract drift surveillance.</p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary-container">radar</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-display text-[11px] uppercase tracking-0.1em text-secondary">
              Node Alias // Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Stripe Webhook"
              className="neo-input w-full px-4 py-3 font-body text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="url" className="font-display text-[11px] uppercase tracking-0.1em text-secondary">
              Target Vector // URL
            </label>
            <div className="flex border-2 border-outline-variant bg-surface-teal-low">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="cursor-pointer border-r-2 border-outline-variant bg-transparent px-4 py-3 font-body text-sm text-primary-container focus:outline-none"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m} className="bg-surface">
                    {m}
                  </option>
                ))}
              </select>
              <input
                id="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/events"
                className="grow border-none bg-transparent px-4 py-3 font-body text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-display text-[11px] uppercase tracking-0.1em text-secondary">
                Headers // Payload
              </label>
              <button
                type="button"
                onClick={addHeaderRow}
                className="flex items-center gap-1 font-display text-[11px] uppercase text-primary-container transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Add Header
              </button>
            </div>
            <div className="flex flex-col gap-3 border-2 border-outline-variant bg-surface-container-highest/30 p-4 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    placeholder="Key (e.g., Authorization)"
                    className="neo-input flex-1 px-3 py-2 font-body text-xs"
                  />
                  <span className="font-body text-xs text-outline">:</span>
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="neo-input flex-1 px-3 py-2 font-body text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeaderRow(i)}
                    className="p-2 text-error transition-colors hover:text-on-error-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
              {headers.length === 0 && (
                <p className="py-2 text-center font-body text-xs text-on-surface-variant">No custom headers.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t-2 border-outline-variant/30 pt-4">
            <label className="flex items-center justify-between font-display text-[11px] uppercase tracking-0.1em text-secondary">
              <span>Polling Frequency // Interval</span>
              <span className="font-body text-xs text-primary">{INTERVAL_LABELS[intervalIndex]}</span>
            </label>
            <div className="px-1 pb-2">
              <input
                type="range"
                min={0}
                max={INTERVAL_STEPS.length - 1}
                step={1}
                value={intervalIndex}
                onChange={(e) => setIntervalIndex(Number(e.target.value))}
                className="w-full accent-primary-container"
              />
              <div className="mt-2 flex justify-between px-1 font-body text-xs text-outline-variant">
                {INTERVAL_LABELS.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-xs text-error">
              {error}
            </div>
          )}

          <div className="border-t-2 border-black pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="neo-button flex w-full items-center justify-center gap-3 py-4 font-display text-base font-bold uppercase disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Initializing...' : 'Initialize Monitoring'}
              {!submitting && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}