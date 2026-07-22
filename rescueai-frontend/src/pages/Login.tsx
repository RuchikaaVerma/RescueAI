import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, LogIn, Shield, Zap } from 'lucide-react';
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
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 45%, #fef2f2 100%)',
      }}
    >
      {/* ── Animated background ── */}
      <div className="animated-bg" />
      <div className="mesh-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* ── Grid texture ── */}
      <div className="absolute inset-0 grid-texture opacity-60 pointer-events-none" />

      {/* ── Central hero glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(220,38,38,0.10), transparent 70%)',
        }}
      />

      {/* ══════════ CARD ══════════ */}
      <div className="relative w-full max-w-sm animate-float-up z-10">

        {/* ── Brand mark ── */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo with spinning ring */}
          <div className="relative mb-5">
            <div
              className="brand-logo w-20 h-20 rounded-2xl flex items-center justify-center relative"
            >
              <Radio
                size={32}
                className="text-white relative z-10"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }}
              />
            </div>

            {/* Outer spinning dashed ring */}
            <div
              className="absolute inset-[-8px] rounded-3xl border-2 border-dashed opacity-25 spin-slow"
              style={{ borderColor: 'var(--color-signal)' }}
            />

            {/* Inner glow */}
            <div
              className="absolute inset-[-2px] rounded-[18px] pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
                filter: 'blur(6px)',
                animation: 'logo-pulse 3s ease-in-out infinite',
              }}
            />
          </div>

          <div
            className="font-display font-bold text-3xl tracking-wide mb-1"
            style={{ color: 'var(--color-bone)' }}
          >
            RESCUE<span className="text-shimmer-red">AI</span>
            <span style={{ color: 'var(--color-ash-dim)', fontWeight: 500 }}> OS</span>
          </div>

          <div
            className="mono-tag text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-ash-dim)' }}
          >
            Disaster Intelligence Platform
          </div>
        </div>

        {/* ── Login card ── */}
        <div className="login-card rounded-3xl p-7 relative overflow-hidden">
          {/* Animated top stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
            style={{
              background: 'linear-gradient(90deg, #991b1b, #dc2626, #ef4444, #dc2626, #991b1b)',
              backgroundSize: '200% 100%',
              animation: 'gradient-slide 2.5s linear infinite',
            }}
          />

          {/* Decorative corner blob */}
          <div
            className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(253,164,175,0.10) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Secure access header */}
          <div className="flex items-center gap-2.5 mb-6 relative z-10">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.18)',
              }}
            >
              <Shield size={13} style={{ color: 'var(--color-signal)' }} />
            </div>
            <span
              className="mono-tag text-[10px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: 'var(--color-signal)' }}
            >
              Secure Access
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full ping-live"
                style={{ background: 'var(--color-signal)' }}
              />
              <span className="mono-tag text-[9px]" style={{ color: 'var(--color-ash-dim)' }}>
                ONLINE
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Email */}
            <div>
              <label
                className="mono-tag text-[10px] uppercase tracking-widest block mb-2 font-semibold"
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
                className="w-full input-light rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="mono-tag text-[10px] uppercase tracking-widest block mb-2 font-semibold"
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
                className="w-full input-light rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs animate-scale-in"
                style={{
                  background: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  color: 'var(--color-signal)',
                }}
              >
                <Zap size={11} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2.5 font-display font-semibold py-3 rounded-xl text-sm tracking-wide"
            >
              <LogIn size={15} />
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                    style={{ animation: 'spin-slow 0.7s linear infinite' }}
                  />
                  Authenticating…
                </span>
              ) : (
                'Enter Command Center'
              )}
            </button>

            <p
              className="text-center text-[11px] leading-relaxed"
              style={{ color: 'var(--color-ash-dim)' }}
            >
              No backend attached?{' '}
              <span style={{ color: 'var(--color-signal)' }}>
                You'll drop straight into a live demo simulation.
              </span>
            </p>
          </form>
        </div>

        {/* ── Footer tag ── */}
        <div className="flex items-center justify-center gap-2 mt-6 opacity-50">
          <div className="h-px flex-1" style={{ background: 'rgba(220,38,38,0.2)' }} />
          <span className="mono-tag text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-ash-dim)' }}>
            v2.0 · Coastal District
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(220,38,38,0.2)' }} />
        </div>
      </div>
    </div>
  );
}
