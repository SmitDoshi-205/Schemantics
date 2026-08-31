import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const COPY = {
  login: {
    kicker: "PROTOCOL AUTHENTICATION",
    heading: "System Access",
    emailLabel: "Identity Vector [Email]",
    passwordLabel: "Clearance Code [Password]",
    submit: "Initialize Session",
    submitIcon: "login",
    switchPrompt: "Don't have clearance?",
    switchLabel: "Request Access",
    switchTo: "/register",
  },
  register: {
    kicker: "IDENTITY ENROLLMENT",
    heading: "Initialize",
    subheading: "Establish credentials for protocol monitoring.",
    nameLabel: 'Operator Alias // Name',
    emailLabel: "Secure Comm Channel",
    passwordLabel: "Access Key",
    submit: "Create Account",
    submitIcon: "arrow_forward",
    switchPrompt: "Session active?",
    switchLabel: "Login",
    switchTo: "/login",
  },
};

function passwordStrength(password) {
  if (password.length === 0) return 0;
  if (password.length < 8) return 1;
  if (password.length < 12) return 2;
  return 3;
}

export default function AuthForm({ mode }) {
  const isLogin = mode === "login";
  const copy = COPY[mode];
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/dashboard", { state: isLogin ? undefined : { justRegistered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

return (
  <div className="w-full max-w-md">
    <div className="mb-8 text-center">
      <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-on-surface">
        Schemantics
      </h1>

      <p className="font-body text-xs uppercase tracking-wide text-on-surface-variant">
        {copy.kicker}
      </p>
    </div>

    <div className="glass-panel p-8 md:p-10">
      {!isLogin && (
        <div className="mb-8 flex flex-col gap-2 border-b-2 border-black pb-6">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-primary-container">
            {copy.heading}
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            {copy.subheading}
          </p>
        </div>
      )}

      {isLogin && (
        <div className="mb-6">
          <h2 className="mb-2 font-display text-2xl font-semibold text-on-surface">
            {copy.heading}
          </h2>
          <div className="h-0.5 w-12 bg-primary-container" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Name - Registration only */}
        {!isLogin && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant"
            >
              {copy.nameLabel}
            </label>

            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Developer"
              className="neo-input w-full px-3 py-3 font-body text-sm"
            />
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant"
          >
            {copy.emailLabel}
          </label>

          <div className="relative">
            {isLogin && (
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                account_circle
              </span>
            )}

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                isLogin
                  ? "operator@domain.com"
                  : "name@organization.com"
              }
              className={`neo-input w-full py-3 pr-4 font-body text-sm ${
                isLogin ? "pl-10" : "pl-3"
              }`}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="font-display text-[11px] uppercase tracking-0.1em text-on-surface-variant"
          >
            {copy.passwordLabel}
          </label>

          <div className="relative">
            {isLogin && (
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                key
              </span>
            )}

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={
                isLogin ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`neo-input w-full py-3 pr-4 font-body text-sm ${
                isLogin ? "pl-10" : "pl-3"
              }`}
            />
          </div>

          {/* Login: Forgot password */}
          {isLogin ? (
            <div className="mt-1 flex justify-end">
              <a
                href="#"
                className="font-body text-xs text-primary-container underline decoration-1 underline-offset-4 transition-colors hover:text-primary"
              >
                Forgot Clearance?
              </a>
            </div>
          ) : (
            /* Register: Password strength */
            <div className="mt-1 flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-1/3 border border-black ${
                    strength >= i
                      ? strength === 1
                        ? "bg-error"
                        : strength === 2
                          ? "bg-tertiary-container"
                          : "bg-primary-container"
                      : "bg-outline"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-xs text-error">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="neo-button flex items-center justify-center gap-2 py-4 font-display text-sm font-bold uppercase tracking-wide text-on-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">
            {copy.submitIcon}
          </span>

          {submitting ? "Please wait..." : copy.submit}
        </button>
      </form>

      {/* Register footer */}
      {!isLogin && (
        <div className="mt-4 flex justify-between border-t border-outline-variant pt-4 font-body text-[10px] text-outline">
          <span>Schemantics</span>
          <span>v1.0.4-beta</span>
        </div>
      )}
    </div>

    {/* Login/Register switch */}
    {isLogin && (
      <div className="mt-8 space-x-4 text-center">
        <span className="font-body text-xs text-on-surface-variant">
          {copy.switchPrompt}
        </span>

        <Link
          to={copy.switchTo}
          className="font-body text-xs font-bold text-primary-container underline decoration-2 underline-offset-4 transition-colors hover:text-primary"
        >
          {copy.switchLabel}
        </Link>
      </div>
    )}

    {!isLogin && (
      <div className="mt-6 text-center font-body text-xs text-on-surface-variant">
        {copy.switchPrompt}{" "}

        <Link
          to={copy.switchTo}
          className="font-bold text-primary-container underline decoration-primary-container underline-offset-4 transition-colors hover:text-primary"
        >
          {copy.switchLabel}
        </Link>
      </div>
    )}
  </div>
);
}