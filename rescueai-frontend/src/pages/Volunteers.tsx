import { useState } from 'react';
import { Panel } from '../components/Panel';
import { useData } from '../context/DataContext';
import { Users } from 'lucide-react';

export default function Volunteers() {
  const { volunteers } = useData();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const list = showAvailableOnly ? volunteers.filter((v) => v.available) : volunteers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4 animate-float-up">
        <div className="flex items-center gap-4">
          <div className="brand-logo w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <Users size={18} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }} />
          </div>
          <div>
            <div
              className="mono-tag text-[11px] uppercase tracking-[0.2em] mb-0.5"
              style={{ color: 'var(--color-signal)' }}
            >
              Field Network
            </div>
            <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
              Volunteer <span className="text-shimmer-red">Tracking</span>
            </h1>
          </div>
        </div>

        {/* Toggle */}
        <label
          className="flex items-center gap-3 text-xs cursor-pointer select-none"
          style={{ color: 'var(--color-ash)' }}
        >
          <div
            className="relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              background: showAvailableOnly
                ? 'linear-gradient(135deg, var(--color-signal), var(--color-signal-bright))'
                : 'var(--color-line)',
              boxShadow: showAvailableOnly ? '0 0 12px rgba(220,38,38,0.3)' : 'none',
            }}
            onClick={() => setShowAvailableOnly((s) => !s)}
          >
            <div
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300"
              style={{
                left: showAvailableOnly ? '22px' : '2px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
            />
          </div>
          <span className="mono-tag uppercase tracking-wide font-medium">Available only</span>
        </label>
      </div>

      <Panel padded={false}>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3">
          {list.map((v, idx) => (
            <div
              key={v.id}
              className="px-5 py-4 row-hover animate-float-up relative overflow-hidden"
              style={{
                animationDelay: `${idx * 22}ms`,
                borderRight: (idx % 3 !== 2) ? '1px solid rgba(220,38,38,0.08)' : undefined,
                borderBottom: '1px solid rgba(220,38,38,0.08)',
              }}
            >
              {/* Available indicator bar */}
              {v.available && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                  style={{ background: '#16a34a', boxShadow: '0 0 6px rgba(22,163,74,0.4)' }}
                />
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-bone)' }}>
                  {v.name}
                </span>
                <span
                  className="mono-tag text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold badge-pulse"
                  style={
                    v.available
                      ? {
                          color: '#15803d',
                          background: 'rgba(240,253,244,0.9)',
                          border: '1px solid rgba(187,247,208,0.8)',
                          boxShadow: '0 0 8px rgba(22,163,74,0.15)',
                          backdropFilter: 'blur(8px)',
                        }
                      : {
                          color: 'var(--color-ash-dim)',
                          background: 'rgba(249,250,251,0.8)',
                          border: '1px solid rgba(229,231,235,0.6)',
                          backdropFilter: 'blur(8px)',
                        }
                  }
                >
                  {v.available ? 'Available' : 'Deployed'}
                </span>
              </div>

              <div className="text-xs mb-1" style={{ color: 'var(--color-ash)' }}>{v.skills}</div>
              <div className="mono-tag text-[10px]" style={{ color: 'var(--color-ash-dim)' }}>{v.location}</div>

              {v.assignedTask && (
                <div
                  className="mono-tag text-[10px] mt-2 font-semibold flex items-center gap-1"
                  style={{ color: 'var(--color-signal)', textShadow: '0 0 8px rgba(220,38,38,0.2)' }}
                >
                  <span>→</span> {v.assignedTask}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
