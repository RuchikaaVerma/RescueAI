import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, LogIn, Shield } from 'lucide-react';
import { AuthApi } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await AuthApi.login({ email, password });
      localStorage.setItem('rescueai_token', res.token);
      navigate('/');
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center grid-texture relative overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #fef2f2 100%)' }}
    >
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Central red glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(220,38,38,0.1), transparent 60%)' }}
      />

      <div className="relative w-full max-w-sm animate-float-up">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              boxShadow: '0 8px 24px rgba(220,38,38,0.35), 0 0 0 4px rgba(220,38,38,0.1)',
            }}
          >
            <Radio size={28} className="text-white" />
            {/* Animated ring */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                border: '2px solid rgba(220,38,38,0.3)',
                animation: 'ping-light 2s ease-out infinite',
              }}
            />
          </div>
          <div
            className="font-display font-bold text-2xl tracking-wide"
            style={{ color: 'var(--color-bone)' }}
          >
            RESCUE<span style={{ color: 'var(--color-signal)' }}>AI</span> OS
          </div>
          <div
            className="mono-tag text-[10px] uppercase tracking-widest mt-1"
            style={{ color: 'var(--color-ash-dim)' }}
          >
            Disaster Intelligence Platform
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-rose-border)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.08), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* Top red stripe */}
          <div
            className="absolute top-0 left-6 right-6 h-[3px] rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-signal), var(--color-signal-bright))' }}
          />

          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} style={{ color: 'var(--color-signal)' }} />
            <span className="mono-tag text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-signal)' }}>
              Secure Access
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="mono-tag text-[10px] uppercase tracking-widest block mb-1.5 font-semibold"
                style={{ color: 'var(--color-ash)' }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="command@district.gov"
                className="w-full input-light rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label
                className="mono-tag text-[10px] uppercase tracking-widest block mb-1.5 font-semibold"
                style={{ color: 'var(--color-ash)' }}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full input-light rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>
            {error && <p className="text-xs font-medium" style={{ color: 'var(--color-signal)' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 font-display font-semibold py-2.5 rounded-lg text-sm"
            >
              <LogIn size={15} /> {loading ? 'Authenticating…' : 'Enter Command Center'}
            </button>
            <p className="text-center text-[11px]" style={{ color: 'var(--color-ash-dim)' }}>
              No backend attached? You'll drop straight into a live demo simulation.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
