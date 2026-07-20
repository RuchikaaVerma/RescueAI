import type { ReactNode } from 'react';

export function Panel({
  title, eyebrow, right, children, className = '', padded = true,
}: {
  title?: string; eyebrow?: string; right?: ReactNode; children: ReactNode; className?: string; padded?: boolean;
}) {
  return (
    <div className={`hud-panel rounded-xl ${className}`}>
      {(title || right) && (
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--color-line)' }}
        >
          <div>
            {eyebrow && (
              <div
                className="mono-tag text-[10px] uppercase tracking-widest mb-0.5 font-semibold"
                style={{ color: 'var(--color-signal)' }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h3
                className="font-display font-semibold text-base tracking-wide"
                style={{ color: 'var(--color-bone)' }}
              >
                {title}
              </h3>
            )}
          </div>
          {right}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
}

export function StatCard({
  label, value, sub, tone = 'default',
}: { label: string; value: string | number; sub?: string; tone?: 'default' | 'critical' | 'ok' }) {
  const valueColor =
    tone === 'critical'
      ? 'text-glow-red'
      : '';
  const valueStyle =
    tone === 'critical'
      ? { color: 'var(--color-signal)' }
      : { color: 'var(--color-bone)' };

  return (
    <div
      className="hud-panel stat-accent rounded-xl p-5 flex flex-col justify-between min-h-[108px] relative overflow-hidden"
    >
      {/* Subtle red top bar on critical */}
      {tone === 'critical' && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
          style={{ background: 'linear-gradient(90deg, var(--color-signal), var(--color-signal-bright))' }}
        />
      )}
      {/* Background tint on critical */}
      {tone === 'critical' && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.04), transparent)' }}
        />
      )}
      <div
        className="mono-tag text-[10px] uppercase tracking-widest relative z-10"
        style={{ color: 'var(--color-ash)' }}
      >
        {label}
      </div>
      <div className="relative z-10">
        <div className={`font-display font-bold text-3xl ${valueColor}`} style={valueStyle}>
          {value}
        </div>
        {sub && (
          <div className="text-xs mt-1" style={{ color: 'var(--color-ash)' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
