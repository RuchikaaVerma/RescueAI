import type { SeverityLevel, IncidentStatus, ResourceStatus } from '../types';

export function SeverityBadge({ level }: { level: SeverityLevel | null }) {
  if (!level) return null;

  const styles: Record<SeverityLevel, React.CSSProperties> = {
    LOW: {
      color: '#6b7280',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
    },
    MODERATE: {
      color: '#d97706',
      background: '#fffbeb',
      border: '1px solid #fde68a',
    },
    HIGH: {
      color: '#dc2626',
      background: '#fff1f2',
      border: '1px solid #fecdd3',
    },
    CRITICAL: {
      color: '#ffffff',
      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
      border: '1px solid #dc2626',
      boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
    },
  };

  return (
    <span
      className="mono-tag text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 badge-pulse"
      style={styles[level]}
    >
      {level === 'CRITICAL' && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: '#ffffff' }}
        />
      )}
      {level === 'HIGH' && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: '#dc2626' }}
        />
      )}
      {level}
    </span>
  );
}

export function StatusPill({ status }: { status: IncidentStatus }) {
  const active   = ['REPORTED', 'VERIFYING', 'IN_PROGRESS'].includes(status);
  const resolved = ['CONTAINED', 'RESOLVED', 'CLOSED'].includes(status);
  const rejected = status.startsWith('REJECTED');

  let style: React.CSSProperties = {};
  if (rejected) {
    style = { color: '#9ca3af' };
  } else if (resolved) {
    style = { color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 9999, border: '1px solid #bbf7d0', fontSize: '10px' };
  } else if (active) {
    style = { color: '#dc2626', background: '#fff1f2', padding: '2px 8px', borderRadius: 9999, border: '1px solid #fecdd3', fontSize: '10px' };
  } else {
    style = { color: '#6b7280' };
  }

  return (
    <span className="mono-tag text-[10px] uppercase tracking-wider font-semibold" style={style}>
      {active && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ background: '#dc2626', verticalAlign: 'middle' }} />}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function ResourceStatusDot({ status }: { status: ResourceStatus }) {
  const colors: Record<ResourceStatus, string> = {
    AVAILABLE:      '#16a34a',
    DISPATCHED:     '#d97706',
    ON_SITE:        '#dc2626',
    RETURNING:      '#6b7280',
    OUT_OF_SERVICE: '#9ca3af',
  };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: colors[status], boxShadow: `0 0 6px ${colors[status]}60` }}
    />
  );
}
