import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { useConfirm } from "../context/useConfirm";
import { api } from "../lib/api";
import { timeAgo, formatInterval, formatTimestamp } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import ResponseTimeChart from "../components/ResponseTimeChart";
import Reveal from "../components/Reveal";
import Skeleton from "../components/Skeleton";

const INTERVAL_STEPS = [1, 5, 15, 60];
const INTERVAL_LABELS = ["1m", "5m", "15m", "1h"];

function DiffSummary({ diffResult }) {
  if (!diffResult || diffResult.length === 0) {
    return (
      <span className="font-body text-xs text-on-surface-variant">
        No changes
      </span>
    );
  }
  const breaking = diffResult.filter((d) => d.severity === "breaking").length;
  const warning = diffResult.filter((d) => d.severity === "warning").length;

  return (
    <div className="flex gap-2">
      {breaking > 0 && (
        <span className="border border-error bg-error/10 px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase text-error">
          {breaking} breaking
        </span>
      )}
      {warning > 0 && (
        <span className="border border-tertiary-container bg-tertiary-container/10 px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase text-tertiary-container">
          {warning} warning
        </span>
      )}
    </div>
  );
}

function EditEndpointForm({ endpoint, onCancel, onSaved }) {
  const { token } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(endpoint.name);
  const [intervalIndex, setIntervalIndex] = useState(() => {
    const idx = INTERVAL_STEPS.indexOf(endpoint.checkIntervalMinutes);
    return idx === -1 ? 1 : idx;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await api.updateEndpoint(token, endpoint._id, {
        name,
        checkIntervalMinutes: INTERVAL_STEPS[intervalIndex],
      });
      toast.success("Endpoint updated.");
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="glass-panel flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="edit-name"
          className="font-display text-[11px] uppercase tracking-0.1em text-secondary"
        >
          Node Alias // Name
        </label>
        <input
          id="edit-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="neo-input w-full px-4 py-3 font-body text-sm"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between font-display text-[11px] uppercase tracking-0.1em text-secondary">
          <span>Polling Frequency // Interval</span>
          <span className="font-body text-xs text-primary">
            {INTERVAL_LABELS[intervalIndex]}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={INTERVAL_STEPS.length - 1}
          step={1}
          value={intervalIndex}
          onChange={(e) => setIntervalIndex(Number(e.target.value))}
          className="w-full accent-primary-container"
        />
        <div className="flex justify-between px-1 font-body text-xs text-outline-variant">
          {INTERVAL_LABELS.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      {error && (
        <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-xs text-error">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="neo-button-secondary px-4 py-2 font-display text-xs uppercase"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="neo-button px-4 py-2 font-display text-xs font-bold uppercase disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function EndpointDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [endpoint, setEndpoint] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [endpointData, checksData] = await Promise.all([
        api.getEndpoint(token, id),
        api.listChecks(token, id),
      ]);
      setEndpoint(endpointData);
      setChecks(checksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCheckNow() {
    setActing(true);
    try {
      await api.checkNow(token, id);
      await load();
      toast.success("Check complete.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    if (!endpoint) return;
    const ok = await confirm(
      `Stop monitoring "${endpoint.name}"? This cannot be undone.`,
    );
    if (!ok) return;

    setActing(true);
    try {
      await api.deleteEndpoint(token, id);
      toast.success(`"${endpoint.name}" is no longer being monitored.`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
      setActing(false);
    }
  }

  async function handleResetBaseline() {
    if (!endpoint) return;
    const ok = await confirm(
      `Accept the current response shape as the new baseline for "${endpoint.name}"? Past drift history is kept, but future checks compare against this new shape.`,
      { danger: false },
    );
    if (!ok) return;

    setActing(true);
    try {
      await api.resetBaseline(token, id);
      await load();
      toast.success("Baseline reset - new shape captured.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-12 sm:px-10">
        <Skeleton className="h-5 w-40" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-96" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !endpoint) {
    return (
      <div className="mx-auto flex max-w-1200px flex-col items-center gap-4 px-4 py-24 text-center sm:px-10">
        <p className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-sm text-error">
          {error}
        </p>
        <Link
          to="/dashboard"
          className="neo-button-secondary px-4 py-2 font-display text-xs uppercase"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-1200px flex-col gap-8 px-4 py-12 sm:px-10">
      <Link
        to="/dashboard"
        className="group inline-flex w-fit items-center gap-2 font-body text-sm text-outline transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
          arrow_back
        </span>
        Back to Endpoints
      </Link>

      {editing ? (
        <Reveal>
          <EditEndpointForm
            endpoint={endpoint}
            onCancel={() => setEditing(false)}
            onSaved={(updated) => {
              setEndpoint(updated);
              setEditing(false);
            }}
          />
        </Reveal>
      ) : (
        <Reveal>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <h1 className="font-display text-2xl font-bold text-on-surface sm:text-3xl">
                  {endpoint.name}
                </h1>
                <StatusBadge status={endpoint.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-2 border-black bg-tertiary-container px-2 py-0.5 font-body text-xs font-bold text-on-tertiary-container">
                  {endpoint.method}
                </span>
                <span className="break-all font-body text-sm text-on-surface-variant">
                  {endpoint.url}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setEditing(true)}
                disabled={acting}
                className="neo-button-secondary flex items-center gap-2 px-4 py-2 font-display text-xs uppercase disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  edit
                </span>
                Edit
              </button>
              <button
                onClick={handleResetBaseline}
                disabled={acting}
                className="neo-button-secondary flex items-center gap-2 px-4 py-2 font-display text-xs uppercase disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  history_edu
                </span>
                Reset Baseline
              </button>
              <button
                onClick={handleDelete}
                disabled={acting}
                className="neo-button-secondary flex items-center gap-2 px-4 py-2 font-display text-xs uppercase text-error disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  delete
                </span>
                Delete
              </button>
              <button
                onClick={handleCheckNow}
                disabled={acting}
                className="neo-button flex items-center gap-2 px-4 py-2 font-display text-xs font-bold uppercase disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  play_arrow
                </span>
                {acting ? "Working..." : "Check Now"}
              </button>
            </div>
          </div>
        </Reveal>
      )}

      {error && (
        <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <Reveal delay={80}>
            <div className="glass-panel p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-on-surface">
                <span className="material-symbols-outlined text-primary-container">
                  monitoring
                </span>
                Response Metrics
              </h2>
              <ResponseTimeChart checks={checks} />
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="glass-panel p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-on-surface">
                <span className="material-symbols-outlined text-primary-container">
                  history
                </span>
                Check History
              </h2>

              {checks.length === 0 ? (
                <p className="font-body text-sm text-on-surface-variant">
                  No checks recorded yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {checks.map((c) => {
                    const hasDiff = c.diffResult && c.diffResult.length > 0;
                    const row = (
                      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-outline-variant bg-surface-container-lowest px-4 py-3 transition-colors hover:border-primary-container">
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              !c.ok
                                ? "text-error"
                                : c.httpStatus >= 400
                                  ? "text-tertiary-container"
                                  : "text-secondary"
                            }`}
                          >
                            {!c.ok
                              ? "wifi_off"
                              : c.httpStatus >= 400
                                ? "gpp_maybe"
                                : "check_circle"}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-body text-xs text-on-surface">
                              {formatTimestamp(c.timestamp)}
                            </span>
                            <span className="font-body text-[11px] text-on-surface-variant">
                              {c.ok
                                ? `HTTP ${c.httpStatus} · ${c.responseTimeMs}ms`
                                : c.error || "Check failed"}
                            </span>
                          </div>
                        </div>
                        <DiffSummary diffResult={c.diffResult} />
                      </div>
                    );

                    return hasDiff ? (
                      <Link
                        key={c._id}
                        to={`/dashboard/endpoints/${id}/diff/${c._id}`}
                      >
                        {row}
                      </Link>
                    ) : (
                      <div key={c._id}>{row}</div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-8">
          <Reveal delay={100}>
            <div className="glass-panel p-6">
              <h3 className="mb-4 border-b-2 border-black pb-2 font-display text-sm font-semibold uppercase text-on-surface">
                Configuration
              </h3>
              <dl className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <dt className="font-display text-[11px] uppercase text-on-surface-variant">
                    Check Interval
                  </dt>
                  <dd className="font-body text-sm text-on-surface">
                    Every {formatInterval(endpoint.checkIntervalMinutes)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-display text-[11px] uppercase text-on-surface-variant">
                    Last Checked
                  </dt>
                  <dd className="font-body text-sm text-on-surface">
                    {timeAgo(endpoint.lastCheckedAt)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-display text-[11px] uppercase text-on-surface-variant">
                    Headers
                  </dt>
                  <dd className="border-2 border-black bg-surface-container-lowest p-3 font-body text-xs text-on-surface-variant">
                    {Object.keys(endpoint.headers || {}).length === 0
                      ? "None configured"
                      : Object.entries(endpoint.headers).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-secondary">{k}</span>
                            <span className="truncate">{v}</span>
                          </div>
                        ))}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
