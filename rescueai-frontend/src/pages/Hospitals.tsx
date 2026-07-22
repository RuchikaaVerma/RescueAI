import { useData } from '../context/DataContext';
import { Activity } from 'lucide-react';

export default function Hospitals() {
  const { hospitals } = useData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 animate-float-up">
        <div className="brand-logo w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <Activity size={18} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }} />
        </div>
        <div>
          <div
            className="mono-tag text-[11px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: 'var(--color-signal)' }}
          >
            Medical Network
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
            Hospital <span className="text-shimmer-red">Capacity</span>
          </h1>
        </div>
        <div className="ml-auto chip-red px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="mono-tag text-[10px] uppercase tracking-widest">{hospitals.length} online</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {hospitals.map((h, idx) => {
          const pct      = Math.min(100, Math.round((h.currentLoad / h.capacity) * 100));
          const critical = pct >= 90;
          const warn     = pct >= 70;
          const barColor = critical ? '#dc2626' : warn ? '#f59e0b' : '#16a34a';
          const barGlow  = critical ? 'rgba(220,38,38,0.35)' : warn ? 'rgba(245,158,11,0.3)' : 'rgba(22,163,74,0.3)';

          return (
            <div
              key={h.id}
              className="hud-panel rounded-2xl p-5 animate-float-up card-appear"
              style={{
                animationDelay: `${idx * 40}ms`,
                background: critical
                  ? 'rgba(255,241,242,0.7)'
                  : 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Animated top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, ${barColor}90, ${barColor}, ${barColor}90)`,
                  backgroundSize: '200% 100%',
                  animation: critical ? 'gradient-slide 1.5s linear infinite' : 'none',
                  boxShadow: `0 0 8px ${barGlow}`,
                }}
              />

              <div className="flex items-start justify-between mb-4 mt-1">
                <div>
                  <div className="font-display font-semibold text-lg" style={{ color: 'var(--color-bone)' }}>
                    {h.name}
                  </div>
                  <div
                    className="mono-tag text-[10px] uppercase mt-0.5"
                    style={{ color: 'var(--color-ash-dim)' }}
                  >
                    {h.specialties}
                  </div>
                </div>
                {critical && (
                  <span
                    className="mono-tag text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold badge-pulse"
                    style={{
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                      boxShadow: '0 2px 10px rgba(220,38,38,0.4)',
                    }}
                  >
                    Near Capacity
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between mb-2">
                <span className="mono-tag text-[10px] uppercase" style={{ color: 'var(--color-ash)' }}>
                  Bed Load
                </span>
                <span
                  className="font-display font-semibold text-sm"
                  style={{ color: critical ? 'var(--color-signal)' : 'var(--color-bone)' }}
                >
                  {h.currentLoad} / {h.capacity}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(220,38,38,0.08)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                    boxShadow: `0 0 8px ${barGlow}`,
                  }}
                />
              </div>

              <div
                className="text-xs pt-3 mt-4 mono-tag"
                style={{ color: 'var(--color-ash-dim)', borderTop: '1px solid rgba(220,38,38,0.08)' }}
              >
                {h.bloodBankLevels}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
