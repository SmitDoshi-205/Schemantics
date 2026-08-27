const STATUS_MAP = {
  stable: { label: 'STABLE', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  drifted: { label: 'DRIFTED', bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
  broken: { label: 'BROKEN', bg: 'bg-error', text: 'text-on-error' },
  pending_baseline: { label: 'PENDING', bg: 'bg-outline', text: 'text-surface' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending_baseline;
  return (
    <span
      className={`inline-block whitespace-nowrap border-2 border-black px-2 py-1 font-body text-[11px] font-semibold uppercase shadow-neo-sm ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}