import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.forgotPassword(email);
    } finally {
      setSent(true);
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel p-8">
        <h1 className="mb-2 font-display text-2xl font-bold text-on-surface">Reset Clearance</h1>
        <p className="mb-6 font-body text-sm text-on-surface-variant">
          Enter your account email and we'll send a reset link.
        </p>
        {sent ? (
          <p className="border-2 border-secondary bg-secondary-container/20 px-4 py-3 font-body text-sm text-on-surface">
            If that email exists, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@domain.com"
              className="neo-input w-full px-4 py-3 font-body text-sm"
            />
            <button type="submit" disabled={submitting} className="neo-button py-3 font-display text-sm font-bold uppercase disabled:opacity-60">
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center font-body text-xs text-primary-container hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}