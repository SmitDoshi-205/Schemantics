import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const GITHUB_URL = 'https://github.com/SmitDoshi-205/Schemantics';

export default function AuthLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="cyber-grid relative flex min-h-dvh flex-col bg-surface overflow-hidden">
      <div
        className="ambient-glow h-[70vw] max-h-800px w-[70vw] max-w-800px bg-primary-container/30"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', mixBlendMode: 'screen' }}
      />
      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>
      <footer className="relative z-10 py-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-primary-container underline decoration-1 underline-offset-4 transition-colors hover:text-primary"
          >
            GitHub
          </a>
          <p className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant">
            © 2026 Schemantics
          </p>
        </div>
      </footer>
    </div>
  );
}