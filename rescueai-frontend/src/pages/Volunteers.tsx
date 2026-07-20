import { useState } from 'react';
import { Panel } from '../components/Panel';
import { useData } from '../context/DataContext';

export default function Volunteers() {
  const { volunteers } = useData();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const list = showAvailableOnly ? volunteers.filter((v) => v.available) : volunteers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div
            className="inline-flex items-center mono-tag text-[11px] uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full"
            style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            Field Network
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
            Volunteer Tracking
          </h1>
        </div>

        {/* Toggle */}
        <label
          className="flex items-center gap-2.5 text-xs cursor-pointer select-none group"
          style={{ color: 'var(--color-ash)' }}
        >
          <div
            className="relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer"
            style={{ background: showAvailableOnly ? 'var(--color-signal)' : 'var(--color-line)' }}
            onClick={() => setShowAvailableOnly((s) => !s)}
          >
            <div
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              style={{ left: showAvailableOnly ? '18px' : '2px' }}
            />
          </div>
          <span className="mono-tag uppercase tracking-wide">Available only</span>
        </label>
      </div>

      <Panel padded={false}>
        <div
          className="grid sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {list.map((v, idx) => (
            <div
              key={v.id}
              className="px-5 py-4 row-hover animate-float-up"
              style={{
                animationDelay: `${idx * 20}ms`,
                borderRight: (idx % 3 !== 2) ? `1px solid var(--color-line)` : undefined,
                borderBottom: `1px solid var(--color-line)`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-bone)' }}>
                  {v.name}
                </span>
                <span
                  className="mono-tag text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold"
                  style={
                    v.available
                      ? { color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0' }
                      : { color: 'var(--color-ash-dim)', background: 'var(--color-steel)', border: '1px solid var(--color-line)' }
                  }
                >
                  {v.available ? 'Available' : 'Deployed'}
                </span>
              </div>
              <div className="text-xs mb-1" style={{ color: 'var(--color-ash)' }}>{v.skills}</div>
              <div className="mono-tag text-[10px]" style={{ color: 'var(--color-ash-dim)' }}>{v.location}</div>
              {v.assignedTask && (
                <div
                  className="mono-tag text-[10px] mt-1.5 font-semibold"
                  style={{ color: 'var(--color-signal)' }}
                >
                  → {v.assignedTask}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
