import type { ReactNode } from 'react';

export function Panel({
  title, eyebrow, right, children, className = '', padded = true,
}: {
  title?: string; eyebrow?: string; right?: ReactNode; children: ReactNode; className?: string; padded?: boolean;
}) {
  return (
    <div className={`hud-panel panel-stripe rounded-2xl ${className}`}>
      {/* Bottom brackets rendered as children so they stay inside overflow:hidden */}
      <span className="bracket-bl" />
      <span className="bracket-br" />

      {(title || right) && (
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: '1px solid rgba(220,38,38,0.08)',
            background: 'linear-gradient(135deg, rgba(220,38,38,0.025) 0%, transparent 60%)',
          }}
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
                className="font-display font-semibold text-[15px] tracking-wide"
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
  const isCritical = tone === 'critical';

  return (
    <div
      className="hud-panel stat-accent rounded-2xl p-5 flex flex-col justify-between min-h-[112px] relative overflow-hidden card-appear"
    >
      {/* Animated top bar (always on critical, hover on others via CSS) */}
      {isCritical && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, #991b1b, #dc2626, #ef4444, #dc2626, #991b1b)',
            backgroundSize: '200% 100%',
            animation: 'gradient-slide 2s linear infinite',
          }}
        />
      )}

      {/* Critical background tint */}
      {isCritical && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.05), transparent 70%)' }}
        />
      )}

      {/* Decorative corner dot */}
      <div
        className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-40"
        style={{ background: isCritical ? 'var(--color-signal)' : 'var(--color-line-bright)' }}
      />

      <div
        className="mono-tag text-[10px] uppercase tracking-widest relative z-10"
        style={{ color: 'var(--color-ash)' }}
      >
        {label}
      </div>

      <div className="relative z-10">
        <div
          className={`stat-value-glow font-display font-bold text-[2rem] leading-none ${
            isCritical ? 'text-glow-red' : ''
          }`}
          style={{ color: isCritical ? 'var(--color-signal)' : 'var(--color-bone)' }}
        >
          {value}
        </div>
        {sub && (
          <div className="text-xs mt-1.5" style={{ color: 'var(--color-ash)' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
