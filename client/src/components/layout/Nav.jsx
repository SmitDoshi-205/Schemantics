import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const GITHUB_URL = "https://github.com/SmitDoshi-205/Schemantics";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
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

      <div className="flex items-center gap-3">
        {user ? (
          <button
            onClick={handleLogout}
            className="neo-button-secondary px-4 py-2 font-display text-xs uppercase tracking-wide"
          >
            Log out
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="neo-button-secondary px-4 py-2 font-display text-xs uppercase tracking-wide"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="neo-button px-4 py-2 font-display text-xs font-bold uppercase tracking-wide"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
