import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import DriftCard from "../components/DriftCard";
import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';

function SectionHeading({ children }) {
  return (
    <div className="mb-12 flex items-center gap-4">
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface sm:text-3xl">
        {children}
      </h2>
      <div className="h-2px grow bg-black" />
    </div>
  );
}

function FeatureCard({
  icon,
  iconBg,
  iconColor,
  title,
  titleColor,
  children,
  className = "",
}) {
  return (
    <div
      className={`glass-panel group flex flex-col justify-between p-8 transition-transform hover:-translate-y-1 ${className}`}
    >
      <div className="flex flex-col gap-4">
        <div
          className={`mb-2 flex h-12 w-12 items-center justify-center border-2 border-black shadow-neo ${iconBg}`}
        >
          <span
            className={`material-symbols-outlined text-2xl ${iconColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <h3 className={`font-display text-xl font-semibold ${titleColor}`}>
          {title}
        </h3>
        <div className="font-body text-sm text-on-surface-variant">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  
  return (
    <main className="mx-auto flex w-full max-w-1440px flex-col gap-16 px-4 py-16 sm:px-10">
      {/* ---------------- HERO ---------------- */}
      <section className="grid min-h-[60vh] grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <Reveal className="z-10 flex flex-col gap-8 lg:col-span-6">
          <div className="flex w-fit items-center gap-2 border-2 border-primary-container bg-surface-container px-4 py-1 font-body text-xs text-primary-container shadow-neo">
            <span className="animate-pulse-soft">&gt;</span> SYSTEM_STATUS:
            MONITORING_ACTIVE
          </div>
          <h1 className="font-display text-4xl font-bold uppercase leading-tight tracking-tight text-on-surface drop-shadow-[4px_4px_0px_#000000] sm:text-5xl lg:text-6xl">
            Detect silent API failures before they break your app.
          </h1>
          <p className="max-w-xl border-l-4 border-primary-container pl-4 font-body text-base leading-relaxed text-on-surface-variant">
            Go beyond uptime. Monitor response shapes, detect schema drift, and
            catch breaking changes in real-time. Stop debugging production
            issues caused by unannounced contract mutations.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="neo-button group flex items-center gap-3 px-8 py-4 font-display text-sm font-bold uppercase text-on-primary-container"
            >
              Monitor your first API
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                rocket_launch
              </span>
            </Link>
            <a
              href="#how"
              className="neo-button-secondary flex items-center gap-3 px-8 py-4 font-display text-sm font-bold uppercase text-on-surface"
            >
              See how it works
              <span className="material-symbols-outlined">terminal</span>
            </a>
          </div>
        </Reveal>

        <Reveal
          delay={150}
          className="relative flex flex-col items-center gap-8 lg:col-span-6 lg:items-end"
        >
          <div
            className="ambient-glow -z-10 h-420px w-420px bg-primary-container/15"
            style={{ top: "10%", right: "5%" }}
          />
          <div
            className="ambient-glow -z-10 h-300px w-300px bg-tertiary-container/10"
            style={{ bottom: "0%", left: "10%" }}
          />

          <DriftCard
            filename="user_profile_v2.json"
            otherLines={['"id": "usr_91x",']}
            oldLine='"tier": "basic",'
            newLine='"subscription_plan": "basic", // Schema Mutated'
          />
          <DriftCard
            filename="payment_status.json"
            otherLines={['"transaction_id": "tx_442",']}
            oldLine='"amount": 150.00, // number'
            newLine='"amount": "150.00", // Type Mismatch'
            delay="1.2s"
          />
        </Reveal>
      </section>

      {/* ---------------- CORE CAPABILITIES ---------------- */}
      <section id="how" className="flex flex-col gap-2 pt-8 scroll-mt-20">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <h2 className="font-display text-2xl font-bold uppercase text-on-surface sm:text-3xl">
              Core capabilities
            </h2>
            <p className="mt-4 max-w-lg font-body text-sm text-on-surface-variant">
              Most schema drift never shows up in logs. It hides in silent contract changes, renamed fields, type mismatches, and payloads that still return 200. Schemantics watches for the changes that break real consumers, so your team can act before the API contract drifts and your users feel it.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <Reveal delay={0} className="md:col-span-8">
            <FeatureCard
              icon="schema"
              iconBg="bg-secondary-container"
              iconColor="text-on-secondary-container"
              title="Schema Auto-learning"
              titleColor="text-secondary"
              className="h-full"
            >
              No manual OpenAPI specs required. We ingest traffic and
              automatically infer the expected JSON schema, baseline
              performance, and payload structures for every endpoint.
              <div className="relative mt-8 flex h-40 flex-col justify-center gap-2 overflow-hidden border-2 border-black bg-surface-container-lowest p-4">
                <div className="cyber-grid absolute inset-0 opacity-60" />
                {[
                  ["title", "string"],
                  ["id", "number"],
                  ["tags[].name", "string"],
                ].map(([key, type], i) => (
                  <div
                    key={key}
                    className="relative flex w-full justify-between font-body text-xs text-on-surface-variant opacity-0"
                    style={{
                      animation: "line-in .5s ease forwards",
                      animationDelay: `${i * 0.4 + 0.3}s`,
                    }}
                  >
                    <span>{key}</span>
                    <span className="font-semibold text-secondary">{type}</span>
                  </div>
                ))}
                <div className="absolute bottom-3 right-3 border-2 border-black bg-surface px-2 py-1 font-body text-xs text-secondary shadow-neo">
                  Learning: 98%
                </div>
              </div>
            </FeatureCard>
          </Reveal>

          <Reveal delay={120} className="md:col-span-4">
            <FeatureCard
              icon="emergency"
              iconBg="bg-tertiary-container"
              iconColor="text-on-tertiary-container"
              title="Severity Classification"
              titleColor="text-tertiary"
              className="h-full"
            >
              Not all changes are critical. Our engine distinguishes between
              safe additions and catastrophic breaking mutations.
              <div className="mt-8 flex flex-col gap-2">
                <div className="flex items-center justify-between border-2 border-black bg-surface px-3 py-2 shadow-[2px_2px_0px_#000]">
                  <span className="font-body text-sm text-on-surface">
                    P1: TYPE_MISMATCH
                  </span>
                  <div className="h-3 w-3 border border-black bg-error" />
                </div>
                <div className="flex items-center justify-between border-2 border-black bg-surface px-3 py-2 shadow-[2px_2px_0px_#000]">
                  <span className="font-body text-sm text-on-surface">
                    P3: NEW_FIELD_ADDED
                  </span>
                  <div className="h-3 w-3 border border-black bg-secondary" />
                </div>
              </div>
            </FeatureCard>
          </Reveal>

          <Reveal delay={240} className="md:col-span-12">
            <div className="glass-panel flex flex-col items-center gap-8 p-8 transition-transform hover:-translate-y-1 md:flex-row">
              <div className="flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-black bg-primary-container shadow-neo">
                  <span
                    className="material-symbols-outlined text-2xl text-on-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    notifications_active
                  </span>
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-primary">
                  Instant Tactical Alerts
                </h3>
                <p className="max-w-2xl font-body text-sm text-on-surface-variant">
                  Integrate directly into your incident management workflows.
                  Receive structured payloads in email or via Webhook the
                  millisecond a contract is breached.
                </p>
              </div>
              <div className="w-full border-2 border-black bg-surface-container-lowest p-4 font-body text-xs shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] md:w-1/3">
                <div className="text-secondary">POST /api/alerts/webhook</div>
                <div className="mt-2 text-outline-variant">Payload:</div>
                <div className="text-tertiary">"event": "contract_breach",</div>
                <div className="text-tertiary">"endpoint": "/v1/users",</div>
                <div className="text-tertiary">
                  "diff": "field 'email' removed"
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- SEVERITY ---------------- */}
      <section id="severity" className="flex flex-col gap-2 pt-8 scroll-mt-20">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <h2 className="font-display text-2xl font-bold uppercase text-on-surface sm:text-3xl">
              Every change gets classified.
            </h2>
            <p className="mt-4 max-w-lg font-body text-sm text-on-surface-variant">
              Not every diff deserves a 2am page. Here's exactly how Schemantics
              rates what it finds.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Breaking",
              chip: "HIGH",
              chipBg: "bg-error",
              chipText: "text-on-error",
              titleColor: "text-error",
              body: "Catastrophic mutations that break downstream consumers. Includes field removals or data type changes.",
              items: [
                { icon: "cancel", label: "FIELD_REMOVED" },
                { icon: "report", label: "TYPE_MISMATCH" },
              ],
            },
            {
              title: "Warning",
              chip: "MEDIUM",
              chipBg: "bg-tertiary-container",
              chipText: "text-on-tertiary-container",
              titleColor: "text-tertiary-container",
              body: "Non-breaking but significant changes. Includes new fields added or potential property renames.",
              items: [
                { icon: "warning", label: "NEW_FIELD_ADDED" },
                { icon: "compare_arrows", label: "RENAME_DETECTED" },
              ],
            },
            {
              title: "Info",
              chip: "LOW",
              chipBg: "bg-primary-container",
              chipText: "text-on-primary-container",
              titleColor: "text-primary",
              body: "Safe updates with no structural impact. Only data values differ from the established baseline.",
              items: [
                { icon: "info", label: "VALUE_DRIFT" },
                { icon: "check_circle", label: "SCHEMA_STABLE" },
              ],
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <div className="glass-panel flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <h3
                    className={`font-display text-xl font-bold ${s.titleColor}`}
                  >
                    {s.title}
                  </h3>
                  <span
                    className={`border-2 border-black px-2 py-0.5 font-body text-[10px] font-bold uppercase shadow-neo-sm ${s.chipBg} ${s.chipText}`}
                  >
                    {s.chip}
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface-variant">
                  {s.body}
                </p>
                <div className="mt-2 flex flex-col gap-2 border-2 border-black bg-surface-container-lowest p-4">
                  {s.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 font-body text-xs text-on-surface"
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${s.titleColor}`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- WHY SCHEMANTICS ---------------- */}
      <section className="flex flex-col gap-2 pt-8">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <h2 className="font-display text-2xl font-bold uppercase text-on-surface sm:text-3xl">
              why Schemantics?
            </h2>
            <p className="mt-4 max-w-lg font-body text-sm text-on-surface-variant">
              Because uptime is not enough. We monitor the contract behind the response, so your team sees drift before users do.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              icon: "bolt",
              bg: "bg-primary-container",
              color: "text-on-primary-container",
              title: "Zero-Config Setup",
              titleColor: "text-primary",
              body: "Point it at a URL and start monitoring in minutes. No complex configuration required to start monitoring traffic.",
            },
            {
              icon: "group",
              bg: "bg-secondary-container",
              color: "text-on-secondary-container",
              title: "Instant Notifications",
              titleColor: "text-secondary",
              body: "Email and webhook alerts fire the moment a breaking or warning change is detected - no polling required.",
            },
            {
              icon: "history",
              bg: "bg-tertiary-container",
              color: "text-on-tertiary-container",
              title: "Audit-Ready Logs",
              titleColor: "text-tertiary",
              body: "Maintain a complete, immutable history of every check and every schema change over time.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 120}>
              <div className="glass-panel flex h-full flex-col gap-4 p-8 transition-transform hover:-translate-y-1">
                <div
                  className={`mb-2 flex h-12 w-12 items-center justify-center border-2 border-black shadow-neo ${c.bg}`}
                >
                  <span className={`material-symbols-outlined ${c.color}`}>
                    {c.icon}
                  </span>
                </div>
                <h3
                  className={`font-display text-xl font-semibold ${c.titleColor}`}
                >
                  {c.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant">
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- BUILT FOR ---------------- */}
      <section id="for" className="flex flex-col gap-12 pt-8 pb-8 scroll-mt-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="w-fit border-2 border-primary-container bg-surface-container px-3 py-1 font-display text-[14px] uppercase tracking-tight text-primary shadow-neo">
              Built for
            </div>
            <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold uppercase text-primary drop-shadow-[2px_2px_0px_#000000] sm:text-4xl">
                Anyone who depends on an API
                <br />
                they don't control.
              </h2>
              <div className="hidden h-2px grow bg-black sm:block" />
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              icon: "account_box",
              bg: "bg-primary-container",
              color: "text-on-primary-container",
              title: "Solo developers",
              titleColor: "text-primary",
              body: "Running a side project on Stripe, a weather API, or a news feed — with no team to notice when it breaks.",
            },
            {
              icon: "groups",
              bg: "bg-secondary-container",
              color: "text-on-secondary-container",
              title: "Small engineering teams",
              titleColor: "text-secondary",
              body: "Every third-party integration is a liability someone forgot to own. Make the liability visible.",
            },
            {
              icon: "layers",
              bg: "bg-tertiary-container",
              color: "text-on-tertiary-container",
              title: "Internal API owners",
              titleColor: "text-tertiary",
              body: "Catch the breaking change your own backend team ships before the frontend team finds out in prod.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 120}>
              <div className="glass-panel flex h-full flex-col gap-4 p-8 transition-transform hover:-translate-y-1">
                <div
                  className={`mb-2 flex h-12 w-12 items-center justify-center border-2 border-black shadow-neo ${c.bg}`}
                >
                  <span className={`material-symbols-outlined ${c.color}`}>
                    {c.icon}
                  </span>
                </div>
                <h3
                  className={`font-display text-xl font-semibold ${c.titleColor}`}
                >
                  {c.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant">
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <Reveal>
        <section className="glass-panel flex flex-col items-center gap-8 px-6 py-16 text-center sm:px-16">
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="font-display text-3xl font-bold uppercase text-on-surface drop-shadow-[4px_4px_0px_#000000] sm:text-4xl">
              Stop guessing. Start detecting.
            </h2>
            <p className="font-body text-base leading-relaxed text-on-surface-variant">
              Schemantics is the automated defense layer for your API
              dependencies. We don't just check for uptime; we monitor the
              integrity of your data structures so you can catch breaking
              changes before they reach your users.
            </p>
          </div>
          <Link
            to="/register"
            className="neo-button group flex items-center gap-3 px-12 py-6 font-display text-base font-bold uppercase text-on-primary-container"
          >
            Monitor your first API
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
              rocket_launch
            </span>
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
