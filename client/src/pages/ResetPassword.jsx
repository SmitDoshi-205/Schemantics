import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/useToast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      toast.success('Password reset - log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel p-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-on-surface">Set New Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="neo-input w-full px-4 py-3 font-body text-sm"
          />
          {error && <div className="border-2 border-error bg-error-container/20 px-4 py-3 font-body text-xs text-error">{error}</div>}
          <button type="submit" disabled={submitting} className="neo-button py-3 font-display text-sm font-bold uppercase disabled:opacity-60">
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}