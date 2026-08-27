export default function NotificationSettings() {
  return (
    <div className="mx-auto flex max-w-1440px flex-col px-4 py-12 sm:px-10">
      <div className="glass-panel flex min-h-[50vh] flex-col items-center justify-center gap-3 border-dashed p-12 text-center">
        <span className="font-body text-xs uppercase tracking-wider text-on-surface-variant">Coming soon</span>
        <h1 className="font-display text-2xl font-bold text-on-surface">Notification settings</h1>
        <p className="max-w-sm font-body text-sm text-on-surface-variant">
          Toggle email alerts and set a webhook URL - wired to the backend's PATCH /api/auth/notifications.
        </p>
      </div>
    </div>
  );
}