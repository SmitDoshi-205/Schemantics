export default function ResponseTimeChart({ checks }) {
  const withTiming = checks.filter((c) => c.ok && typeof c.responseTimeMs === 'number').slice().reverse();

  if (withTiming.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center border-2 border-black bg-surface-container-lowest">
        <span className="font-body text-xs text-on-surface-variant">No successful checks yet.</span>
      </div>
    );
  }

  const max = Math.max(...withTiming.map((c) => c.responseTimeMs), 1);

  function barColor(check) {
    if (!check.diffResult || check.diffResult.length === 0) return 'bg-secondary';
    const hasBreaking = check.diffResult.some((d) => d.severity === 'breaking');
    return hasBreaking ? 'bg-error' : 'bg-tertiary-container';
  }

  return (
    <div className="border-2 border-black bg-surface-container-lowest p-4">
      <div className="mb-2 flex justify-between font-body text-[11px] text-on-surface-variant">
        <span>Response time</span>
        <span>{max}ms max</span>
      </div>
      <div className="flex h-32 items-end gap-1">
        {withTiming.map((c) => (
          <div
            key={c._id}
            title={`${c.responseTimeMs}ms - ${new Date(c.timestamp).toLocaleString()}`}
            className={`flex-1 rounded-t-sm ${barColor(c)}`}
            style={{ height: `${Math.max((c.responseTimeMs / max) * 100, 4)}%` }}
          />
        ))}
      </div>
    </div>
  );
}