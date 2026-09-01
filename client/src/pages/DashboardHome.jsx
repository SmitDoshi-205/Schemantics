import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useConfirm } from '../context/useConfirm';
import { api } from '../lib/api';
import { timeAgo, formatInterval } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Reveal from '../components/Reveal';

function StatCard({ label, value, color }) {
  return (
    <div className="glass-panel flex flex-col gap-2 p-6">
      <span className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant">{label}</span>
      <span className={`font-display text-3xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

export default function DashboardHome() {
  const { token, user } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const confirm = useConfirm();

  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingIds, setActingIds] = useState(() => new Set());
  const [checkingAll, setCheckingAll] = useState(false);

  const loadEndpoints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listEndpoints(token);
      setEndpoints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEndpoints();
  }, [loadEndpoints]);

  function setActing(id, isActing) {
    setActingIds((prev) => {
      const next = new Set(prev);
      if (isActing) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleCheckNow(id, name) {
    setActing(id, true);
    try {
      const result = await api.checkNow(token, id);
      setEndpoints((prev) =>
        prev.map((ep) =>
          ep._id === id ? { ...ep, status: result.status, lastCheckedAt: result.checkedAt } : ep
        )
      );
      toast.success(`"${name}" checked - now ${result.status}.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(id, false);
    }
  }

  async function handleDelete(id, name) {
    const ok = await confirm(`Stop monitoring "${name}"? This cannot be undone.`);
    if (!ok) return;

    setActing(id, true);
    try {
      await api.deleteEndpoint(token, id);
      setEndpoints((prev) => prev.filter((ep) => ep._id !== id));
      toast.success(`"${name}" is no longer being monitored.`);
    } catch (err) {
      toast.error(err.message);
      setActing(id, false);
    }
  }

  async function handleCheckAll() {
    setCheckingAll(true);
    try {
      await Promise.all(endpoints.map((ep) => api.checkNow(token, ep._id).catch(() => null)));
      await loadEndpoints();
      toast.success('All endpoints checked.');
    } finally {
      setCheckingAll(false);
    }
  }

  const stats = {
    active: endpoints.length,
    drifted: endpoints.filter((e) => e.status === 'drifted').length,
    broken: endpoints.filter((e) => e.status === 'broken').length,
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Developer';
  const greeting = location.state?.justRegistered ? `Welcome, ${displayName}.` : `Welcome back, ${displayName}.`;

  return (
    <div className="relative mx-auto flex max-w-1440px flex-col gap-10 px-4 py-12 sm:px-10">
      <Reveal>
        <h1 className="font-display text-3xl font-bold text-on-surface sm:text-4xl">{greeting}</h1>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard label="Active Endpoints" value={stats.active} color="text-secondary" />
          <StatCard label="Drifted" value={stats.drifted} color="text-drift-warning" />
          <StatCard label="Broken" value={stats.broken} color="text-drift-critical" />
        </div>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-on-surface-variant">
          Monitored Endpoints
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleCheckAll}
            disabled={checkingAll || endpoints.length === 0}
            className="neo-button-secondary flex items-center gap-2 px-4 py-2 font-display text-xs uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">radar</span>
            {checkingAll ? 'Checking...' : 'Check All'}
          </button>
          <Link
            to="/dashboard/add"
            className="neo-button flex items-center gap-2 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Endpoint
          </Link>
        </div>
      </div>

      {error && (
        <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel flex min-h-200px items-center justify-center">
          <span className="font-body text-sm text-on-surface-variant">Loading endpoints...</span>
        </div>
      ) : endpoints.length === 0 ? (
        <div className="glass-panel flex min-h-240px flex-col items-center justify-center gap-4 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">radar</span>
          <h3 className="font-display text-xl font-semibold text-on-surface">No endpoints yet</h3>
          <p className="max-w-sm font-body text-sm text-on-surface-variant">
            Register your first API and Schemantics will capture its baseline shape immediately.
          </p>
          <Link to="/dashboard/add" className="neo-button px-6 py-3 font-display text-sm font-bold uppercase">
            Add Your First Endpoint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {endpoints.map((ep, i) => (
            <Reveal key={ep._id} delay={i * 60}>
              <div className="glass-panel flex h-full flex-col gap-4 p-6 transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/dashboard/endpoints/${ep._id}`} className="block truncate font-display text-lg font-semibold text-on-surface hover:text-primary-container">
                      {ep.name}
                    </Link>
                    <p className="truncate font-body text-xs text-on-surface-variant">{ep.url}</p>
                  </div>
                  <StatusBadge status={ep.status} />
                </div>

                <div className="flex items-center gap-3 font-body text-xs text-on-surface-variant">
                  <span className="border border-outline-variant px-1.5 py-0.5 font-semibold text-tertiary">
                    {ep.method}
                  </span>
                  <span>every {formatInterval(ep.checkIntervalMinutes)}</span>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                  <span className="font-body text-xs text-on-surface-variant">{timeAgo(ep.lastCheckedAt)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckNow(ep._id, ep.name)}
                      disabled={actingIds.has(ep._id)}
                      title="Check now"
                      className="flex h-8 w-8 items-center justify-center border-2 border-black bg-surface-container-high text-on-surface shadow-neo-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {actingIds.has(ep._id) ? 'hourglass_empty' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(ep._id, ep.name)}
                      disabled={actingIds.has(ep._id)}
                      title="Delete endpoint"
                      className="flex h-8 w-8 items-center justify-center border-2 border-black bg-surface-container-high text-error shadow-neo-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}