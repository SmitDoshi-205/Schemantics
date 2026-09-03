import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";

const GITHUB_URL = "https://github.com/SmitDoshi-205/Schemantics";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <header className="sticky left-0 top-0 z-50 flex w-full items-center justify-between border-b-2 border-black bg-surface/80 px-4 py-4 shadow-4px_4px_0px_0px_rgba(0,0,0,1) backdrop-blur-lg sm:px-10">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-primary"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            troubleshoot
          </span>
          Schemantics
        </Link>

        <nav className="ml-4 hidden items-center gap-6 md:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant transition-all hover:translate-x-1 hover:translate-y-1 hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/settings"
                className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant transition-all hover:translate-x-1 hover:translate-y-1 hover:text-primary"
              >
                Notification Settings
              </Link>
            </>
          ) : (
            <>
              <a
                href="/#how"
                className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant transition-all hover:translate-x-1 hover:translate-y-1 hover:text-primary"
              >
                How it works
              </a>
              <a
                href="/#severity"
                className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant transition-all hover:translate-x-1 hover:translate-y-1 hover:text-primary"
              >
                Severity
              </a>
              <a
                href="/#for"
                className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant transition-all hover:translate-x-1 hover:translate-y-1 hover:text-primary"
              >
                Built For
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant transition-all hover:translate-x-1 hover:translate-y-1 hover:text-primary"
              >
                GitHub
              </a>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <button
            onClick={handleLogout}
            className="neo-button-secondary whitespace-nowrap px-2 py-2 font-display text-[10px] uppercase tracking-wide sm:px-4 sm:text-xs"
          >
            Log out
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="neo-button-secondary whitespace-nowrap px-2 py-2 font-display text-[10px] uppercase tracking-wide sm:px-4 sm:text-xs"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="neo-button whitespace-nowrap px-2 py-2 font-display text-[10px] font-bold uppercase tracking-wide sm:px-4 sm:text-xs"
            >
              Get started
            </Link>
          </>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 flex-none items-center justify-center border-2 border-black bg-surface-container-high md:hidden"
        >
          <span className="material-symbols-outlined text-[20px]">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
      </header>
      {menuOpen && (
        <div className="glass-panel fixed left-0 right-0 top-72px z-40 flex flex-col gap-1 p-4 md:hidden">
        {user ? (
          <>
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 font-body text-sm text-on-surface"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 font-body text-sm text-on-surface"
            >
              Notification Settings
            </Link>
          </>
        ) : (
          <>
            <a
              href="/#how"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 font-body text-sm text-on-surface"
            >
              How it works
            </a>
            <a
              href="/#severity"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 font-body text-sm text-on-surface"
            >
              Severity
            </a>
            <a
              href="/#for"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 font-body text-sm text-on-surface"
            >
              Built For
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 font-body text-sm text-on-surface"
            >
              GitHub
            </a>
          </>
        )}
        </div>
      )}
    </>
  );
}
