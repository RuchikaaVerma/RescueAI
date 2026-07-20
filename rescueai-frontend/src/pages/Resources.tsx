import { Panel } from '../components/Panel';
import { ResourceStatusDot } from '../components/Badges';
import { useData } from '../context/DataContext';

const TYPE_LABELS: Record<string, string> = {
  AMBULANCE:    'Ambulances',   FIRE_TRUCK:   'Fire Trucks',  HELICOPTER:   'Helicopters',
  RESCUE_BOAT:  'Rescue Boats', MEDICAL_KIT:  'Medical Kits', BLOOD_UNIT:   'Blood Units',
  RELIEF_TRUCK: 'Relief Trucks', DRONE:        'Drones',       OTHER:        'Other Assets',
};

const STATUS_BG: Record<string, React.CSSProperties> = {
  AVAILABLE:      { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  DISPATCHED:     { background: '#fffbeb', border: '1px solid #fde68a' },
  ON_SITE:        { background: '#fff1f2', border: '1px solid #fecdd3' },
  RETURNING:      { background: '#f9fafb', border: '1px solid #e5e7eb' },
  OUT_OF_SERVICE: { background: '#faf5ff', border: '1px solid #ddd6fe' },
};

export default function Resources() {
  const { resources } = useData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <div
          className="inline-flex items-center mono-tag text-[11px] uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full"
          style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          Fleet &amp; Stock
        </div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
          Resource Inventory
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {resources.map((r, idx) => (
          <div
            key={r.id}
            className="hud-panel rounded-xl p-5 animate-float-up"
            style={{ animationDelay: `${idx * 30}ms`, ...(STATUS_BG[r.status] ?? {}) }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="mono-tag text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-ash)' }}>
                {TYPE_LABELS[r.type] ?? r.type}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] mono-tag uppercase" style={{ color: 'var(--color-ash-dim)' }}>
                <ResourceStatusDot status={r.status} />
                {r.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="font-display font-bold text-4xl" style={{ color: 'var(--color-bone)' }}>
              {r.quantity}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-ash-dim)' }}>units tracked</div>
            {r.status === 'OUT_OF_SERVICE' && (
              <div
                className="mt-3 pt-3 text-[11px] font-semibold"
                style={{ borderTop: '1px solid var(--color-line)', color: 'var(--color-signal)' }}
              >
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
