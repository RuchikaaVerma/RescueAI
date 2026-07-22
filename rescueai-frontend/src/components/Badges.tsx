import type { SeverityLevel, IncidentStatus, ResourceStatus } from '../types';

export function SeverityBadge({ level }: { level: SeverityLevel | null }) {
  if (!level) return null;

  const styles: Record<SeverityLevel, React.CSSProperties> = {
    LOW: {
      color: '#6b7280',
      background: 'rgba(249,250,251,0.9)',
      border: '1px solid rgba(229,231,235,0.8)',
      backdropFilter: 'blur(8px)',
    },
    MODERATE: {
      color: '#b45309',
      background: 'rgba(255,251,235,0.9)',
      border: '1px solid rgba(253,230,138,0.8)',
      backdropFilter: 'blur(8px)',
    },
    HIGH: {
      color: '#dc2626',
      background: 'rgba(255,241,242,0.9)',
      border: '1px solid rgba(254,205,211,0.8)',
      backdropFilter: 'blur(8px)',
    },
    CRITICAL: {
      color: '#ffffff',
      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
      border: '1px solid rgba(220,38,38,0.5)',
      boxShadow: '0 2px 10px rgba(220,38,38,0.35), 0 0 0 2px rgba(220,38,38,0.1)',
      backdropFilter: 'blur(8px)',
    },
  };

  return (
    <span
      className="mono-tag text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 badge-pulse"
      style={styles[level]}
    >
      {level === 'CRITICAL' && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: '#ffffff',
            boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            animation: 'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />
      )}
      {level === 'HIGH' && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.5)' }}
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
    style = {
      color: '#9ca3af',
      background: 'rgba(249,250,251,0.7)',
      padding: '2px 8px',
      borderRadius: 9999,
      border: '1px solid rgba(229,231,235,0.6)',
      fontSize: '10px',
      backdropFilter: 'blur(8px)',
    };
  } else if (resolved) {
    style = {
      color: '#15803d',
      background: 'rgba(240,253,244,0.9)',
      padding: '2px 8px',
      borderRadius: 9999,
      border: '1px solid rgba(187,247,208,0.8)',
      fontSize: '10px',
      boxShadow: '0 0 8px rgba(22,163,74,0.12)',
      backdropFilter: 'blur(8px)',
    };
  } else if (active) {
    style = {
      color: '#dc2626',
      background: 'rgba(255,241,242,0.9)',
      padding: '2px 8px',
      borderRadius: 9999,
      border: '1px solid rgba(254,205,211,0.8)',
      fontSize: '10px',
      boxShadow: '0 0 8px rgba(220,38,38,0.12)',
      backdropFilter: 'blur(8px)',
    };
  } else {
    style = { color: '#6b7280', fontSize: '10px' };
  }

  return (
    <span className="mono-tag uppercase tracking-wider font-semibold" style={style}>
      {active && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-1"
          style={{
            background: '#dc2626',
            verticalAlign: 'middle',
            boxShadow: '0 0 6px rgba(220,38,38,0.5)',
            animation: 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />
      )}
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
  const color = colors[status];
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 8px ${color}80, 0 0 0 2px ${color}20`,
      }}
    />
  );
}
