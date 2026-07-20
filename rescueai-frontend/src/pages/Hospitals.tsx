import { useData } from '../context/DataContext';

export default function Hospitals() {
  const { hospitals } = useData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <div
          className="inline-flex items-center mono-tag text-[11px] uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full"
          style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          Medical Network
        </div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
          Hospital Capacity
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {hospitals.map((h, idx) => {
          const pct      = Math.min(100, Math.round((h.currentLoad / h.capacity) * 100));
          const critical = pct >= 90;
          const warn     = pct >= 70;
          const barColor = critical ? '#dc2626' : warn ? '#f59e0b' : '#16a34a';

          return (
            <div
              key={h.id}
              className="hud-panel rounded-xl p-5 animate-float-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Top accent stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}80)` }}
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
                    className="mono-tag text-[9px] uppercase tracking-widest px-2 py-1 rounded-full font-semibold"
                    style={{ color: '#ffffff', background: '#dc2626', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }}
                  >
                    Near Capacity
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between mb-1.5">
                <span className="mono-tag text-[10px] uppercase" style={{ color: 'var(--color-ash)' }}>
                  Bed Load
                </span>
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-bone)' }}>
                  {h.currentLoad} / {h.capacity}
                </span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: '#f0f0f0' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
                />
              </div>
              <div
                className="text-xs pt-3 mt-4 mono-tag"
                style={{ color: 'var(--color-ash-dim)', borderTop: '1px solid var(--color-line)' }}
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
