import { Panel } from '../components/Panel';
import { ResourceStatusDot } from '../components/Badges';
import { useData } from '../context/DataContext';
import { Package } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  AMBULANCE:    'Ambulances',   FIRE_TRUCK:   'Fire Trucks',  HELICOPTER:   'Helicopters',
  RESCUE_BOAT:  'Rescue Boats', MEDICAL_KIT:  'Medical Kits', BLOOD_UNIT:   'Blood Units',
  RELIEF_TRUCK: 'Relief Trucks', DRONE:        'Drones',       OTHER:        'Other Assets',
};

const STATUS_BG: Record<string, React.CSSProperties> = {
  AVAILABLE:      { background: 'rgba(240,253,244,0.82)', border: '1px solid rgba(187,247,208,0.6)' },
  DISPATCHED:     { background: 'rgba(255,251,235,0.82)', border: '1px solid rgba(253,230,138,0.6)' },
  ON_SITE:        { background: 'rgba(255,241,242,0.82)', border: '1px solid rgba(254,205,211,0.6)' },
  RETURNING:      { background: 'rgba(249,250,251,0.82)', border: '1px solid rgba(229,231,235,0.6)' },
  OUT_OF_SERVICE: { background: 'rgba(250,245,255,0.82)', border: '1px solid rgba(221,214,254,0.6)' },
};

export default function Resources() {
  const { resources } = useData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 animate-float-up">
        <div className="brand-logo w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <Package size={18} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }} />
        </div>
        <div>
          <div
            className="mono-tag text-[11px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: 'var(--color-signal)' }}
          >
            Fleet &amp; Stock
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
            Resource <span className="text-shimmer-red">Inventory</span>
          </h1>
        </div>
        <div className="ml-auto chip-red px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="mono-tag text-[10px] uppercase tracking-widest">{resources.length} asset types</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {resources.map((r, idx) => (
          <div
            key={r.id}
            className="hud-panel rounded-2xl p-5 animate-float-up card-appear relative overflow-hidden"
            style={{
              animationDelay: `${idx * 30}ms`,
              backdropFilter: 'blur(20px)',
              ...(STATUS_BG[r.status] ?? {}),
            }}
          >
            {/* Status glow top strip */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60"
              style={{
                background: r.status === 'AVAILABLE'
                  ? '#16a34a'
                  : r.status === 'ON_SITE'
                  ? 'var(--color-signal)'
                  : r.status === 'DISPATCHED'
                  ? '#d97706'
                  : 'var(--color-line)',
              }}
            />

            <div className="flex items-center justify-between mb-4">
              <span className="mono-tag text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-ash)' }}>
                {TYPE_LABELS[r.type] ?? r.type}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] mono-tag uppercase" style={{ color: 'var(--color-ash-dim)' }}>
                <ResourceStatusDot status={r.status} />
                {r.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div
              className="font-display font-bold text-[2.5rem] leading-none stat-value-glow"
              style={{ color: 'var(--color-bone)' }}
            >
              {r.quantity}
            </div>
            <div className="text-xs mt-1.5" style={{ color: 'var(--color-ash-dim)' }}>units tracked</div>

            {r.status === 'OUT_OF_SERVICE' && (
              <div
                className="mt-3 pt-3 text-[11px] font-semibold flex items-center gap-1.5"
                style={{ borderTop: '1px solid rgba(220,38,38,0.1)', color: 'var(--color-signal)' }}
              >
                <span style={{ textShadow: '0 0 8px rgba(220,38,38,0.3)' }}>⚠</span>
                Requires maintenance dispatch
              </div>
            )}
          </div>
        ))}
      </div>

      <Panel eyebrow="Gap Alerts" title="Allocation Watch">
        <p className="text-sm" style={{ color: 'var(--color-ash)' }}>
          The Resource Planner agent flags a gap alert whenever demand from active incidents outpaces available units of a given type.
          Currently{' '}
          <span
            className="font-semibold"
            style={{ color: 'var(--color-signal)' }}
          >
            {resources.filter((r) => r.status === 'OUT_OF_SERVICE').length} asset type(s)
          </span>{' '}
          are out of service and may need reassignment from a neighboring sector.
        </p>
      </Panel>
    </div>
  );
}
