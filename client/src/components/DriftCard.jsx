export default function DriftCard({ filename, oldLine, newLine, otherLines = [], delay = '0s' }) {
  return (
    <div className="glass-panel w-full max-w-md p-6" style={{ animation: 'pulse-soft 4s ease-in-out infinite', animationDelay: delay }}>
      <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-2">
        <span className="cyber-chip border-error bg-error/10 text-error">
          <span style={{ color: "black" }}>DRIFT DETECTED</span>
        </span>
        <span className="font-body text-xs text-on-surface-variant">{filename}</span>
      </div>
      <pre className="overflow-x-auto border-2 border-black bg-surface-container-lowest p-4 font-body text-xs leading-relaxed text-on-surface shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
        <span className="block">{'{'}</span>
        {otherLines.map((line) => (
          <span key={line} className="block pl-4">
            {line}
          </span>
        ))}
        <span className="block pl-4 text-outline line-through">{oldLine}</span>
        <span className="block pl-4 font-bold text-error">{newLine}</span>
        <span className="block">{'}'}</span>
      </pre>
    </div>
  );
}