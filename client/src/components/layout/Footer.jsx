import { useAuth } from '../../context/useAuth';

const GITHUB_URL = 'https://github.com/SmitDoshi-205/Schemantics';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="mt-auto w-full border-t-2 border-black bg-surface-container-lowest px-4 py-5 sm:px-10">
      <div className="mx-auto flex max-w-1440px flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 font-display text-[11px] uppercase tracking-0.1em text-on-surface">
          <span className="material-symbols-outlined text-[16px]">security</span>
          Schemantics
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6">
          {!user && (
            <>
              <a href="/#how" className="font-body text-sm text-on-surface-variant transition-colors hover:text-tertiary">
                How it works
              </a>
              <a href="/#severity" className="font-body text-sm text-on-surface-variant transition-colors hover:text-tertiary">
                Severity
              </a>
              <a href="/#for" className="font-body text-sm text-on-surface-variant transition-colors hover:text-tertiary">
                Built For
              </a>
            </>
          )}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-on-surface-variant transition-colors hover:text-tertiary"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}