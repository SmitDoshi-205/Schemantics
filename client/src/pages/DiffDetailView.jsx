import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useConfirm } from '../context/useConfirm';
import { api } from '../lib/api';
import { formatTimestamp } from '../lib/format';
import Reveal from '../components/Reveal';

const CHANGE_ICON = { removed: '−', added: '+', type_changed: '~' };
const CHANGE_LABEL = { removed: 'removed', added: 'added', type_changed: 'type changed' };

function DiffRow({ entry }) {
  const isRemoved = entry.changeType === 'removed';
  const isAdded = entry.changeType === 'added';
  const color = isRemoved ? 'text-error' : isAdded ? 'text-secondary' : 'text-tertiary-container';

  return (
    <div className="flex items-center gap-4 border-t border-outline-variant px-5 py-3 font-body text-sm first:border-t-0">
      <span className={`w-4 flex-none text-center font-bold ${color}`}>{CHANGE_ICON[entry.changeType]}</span>
      <span className={`flex-1 font-semibold ${color}`}>{entry.path}</span>
      <span className="text-xs text-on-surface-variant">
        {entry.oldType && <span className="line-through">{entry.oldType}</span>}
        {entry.oldType && entry.newType && ' → '}
        {entry.newType && <span className="text-on-surface">{entry.newType}</span>}
        {!entry.oldType && !entry.newType && CHANGE_LABEL[entry.changeType]}
      </span>
      <span
        className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          entry.severity === 'breaking' ? 'border-error text-error' : 'border-tertiary-container text-tertiary-container'
        }`}
      >
        {entry.severity}
      </span>
    </div>
  );
}

export default function DiffDetailView() {
  const { id, checkId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [endpoint, setEndpoint] = useState(null);
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [endpointData, checkData] = await Promise.all([
        api.getEndpoint(token, id),
        api.getCheckDiff(token, id, checkId),
      ]);
      setEndpoint(endpointData);
      setCheck(checkData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id, checkId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAcceptBaseline() {
    if (!endpoint) return;
    const ok = await confirm(
      `Accept the current response shape as the new baseline for "${endpoint.name}"? This diff will remain in history, but future checks will compare against the new shape.`,
      { danger: false }
    );
    if (!ok) return;

    setActing(true);
    try {
      await api.resetBaseline(token, id);
      toast.success('Baseline reset - this change is now the accepted shape.');
      navigate(`/dashboard/endpoints/${id}`);
    } catch (err) {
      toast.error(err.message);
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-1000px items-center justify-center px-4 py-24 sm:px-10">
        <span className="font-body text-sm text-on-surface-variant">Loading diff...</span>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="mx-auto flex max-w-1000px flex-col items-center gap-4 px-4 py-24 text-center sm:px-10">
        <p className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-sm text-error">
          {error || 'Check not found.'}
        </p>
        <Link to={`/dashboard/endpoints/${id}`} className="neo-button-secondary px-4 py-2 font-display text-xs uppercase">
          Back to Endpoint
        </Link>
      </div>
    );
  }

  const breaking = check.diffResult.filter((d) => d.severity === 'breaking');
  const warning = check.diffResult.filter((d) => d.severity === 'warning');
  const isBreaking = breaking.length > 0;

  let prettySample = check.rawResponseSample;
  try {
    prettySample = JSON.stringify(JSON.parse(check.rawResponseSample), null, 2);
  } catch {
    // not valid JSON (e.g. truncated) - fall back to showing it raw
  }

  return (
    <div className="mx-auto flex max-w-1000px flex-col gap-8 px-4 py-12 sm:px-10">
      <Link
        to={`/dashboard/endpoints/${id}`}
        className="group inline-flex w-fit items-center gap-2 font-body text-sm text-outline transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
          arrow_back
        </span>
        Back to {endpoint?.name || 'Endpoint'}
      </Link>

      <Reveal>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold text-on-surface sm:text-3xl">
              Drift Detected: {isBreaking ? 'Breaking Change' : 'Warning'}
            </h1>
            <p className="font-body text-sm text-on-surface-variant">
              Detected {formatTimestamp(check.timestamp)} · Check #{check._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={handleAcceptBaseline}
            disabled={acting}
            className="neo-button flex-none px-6 py-3 font-display text-xs font-bold uppercase disabled:opacity-60"
          >
            {acting ? 'Working...' : 'Accept as Baseline'}
          </button>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div
          className={`glass-panel flex items-start gap-4 border-l-4 p-6 ${
            isBreaking ? 'border-l-error' : 'border-l-tertiary-container'
          }`}
        >
          <span className={`material-symbols-outlined mt-1 text-2xl ${isBreaking ? 'text-error' : 'text-tertiary-container'}`}>
            warning
          </span>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <span className={`font-display text-lg font-bold ${isBreaking ? 'text-error' : 'text-tertiary-container'}`}>
                {isBreaking ? 'BREAKING SEVERITY' : 'WARNING SEVERITY'}
              </span>
            </div>
            <p className="font-body text-sm text-on-surface">
              {breaking.length > 0 && `${breaking.length} breaking change${breaking.length > 1 ? 's' : ''}`}
              {breaking.length > 0 && warning.length > 0 && ', '}
              {warning.length > 0 && `${warning.length} warning${warning.length > 1 ? 's' : ''}`} detected in this
              response.
            </p>
            {isBreaking && (
              <p className="mt-2 font-body text-sm text-on-surface-variant">
                This change violates the current API contract and may cause downstream failures.
              </p>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="glass-panel overflow-hidden">
          <div className="border-b-2 border-black bg-surface-variant px-5 py-3">
            <span className="font-display text-xs uppercase tracking-wide text-on-surface">Field Changes</span>
          </div>
          {check.diffResult.map((entry) => (
            <DiffRow key={entry.path} entry={entry} />
          ))}
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="glass-panel overflow-hidden">
          <div className="border-b-2 border-black bg-surface-variant px-5 py-3">
            <span className="font-display text-xs uppercase tracking-wide text-on-surface">
              Response Sample at Time of Check
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-body text-xs leading-relaxed text-on-surface-variant shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
            {prettySample}
          </pre>
        </div>
      </Reveal>
    </div>
  );
}