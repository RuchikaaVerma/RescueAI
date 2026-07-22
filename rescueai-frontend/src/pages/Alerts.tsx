import { Bell, Radio } from 'lucide-react';
import { Panel } from '../components/Panel';
import { useData } from '../context/DataContext';

const CHANNEL_LABELS: Record<string, string> = {
  SMS: 'SMS', PUSH_NOTIFICATION: 'Push', APP_BANNER: 'App Banner', EMAIL: 'Email', PUBLIC_ANNOUNCEMENT: 'Public Announcement',
};

const CHANNEL_COLORS: Record<string, React.CSSProperties> = {
  SMS:               { background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3' },
  PUSH_NOTIFICATION: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  APP_BANNER:        { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
  EMAIL:             { background: '#fefce8', color: '#ca8a04', border: '1px solid #fde68a' },
  PUBLIC_ANNOUNCEMENT: { background: '#faf5ff', color: '#7c3aed', border: '1px solid #ddd6fe' },
};

export default function Alerts() {
  const { alerts } = useData();
  const sorted = [...alerts].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 animate-float-up">
        <div
          className="brand-logo w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        >
          <Bell size={18} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }} />
        </div>
        <div>
          <div
            className="mono-tag text-[11px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: 'var(--color-signal)' }}
          >
            Communication Agent Output
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
            Real-time <span className="text-shimmer-red">Alerts</span>
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2 chip-red px-3 py-1.5 rounded-full">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="mono-tag text-[10px] uppercase tracking-widest">{sorted.length} broadcasts</span>
        </div>
      </div>

      <Panel padded={false}>
        <div className="divide-red">
          {sorted.map((a, idx) => (
            <div
              key={a.id}
              className="px-5 py-4 flex items-start gap-4 row-hover animate-float-up relative overflow-hidden"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Radio icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.04))',
                  border: '1px solid rgba(220,38,38,0.18)',
                  boxShadow: '0 2px 8px rgba(220,38,38,0.08)',
                }}
              >
                <Radio size={14} style={{ color: 'var(--color-signal)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="mono-tag text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold badge-pulse"
                    style={{
                      ...(CHANNEL_COLORS[a.channel] ?? { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }),
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {CHANNEL_LABELS[a.channel] ?? a.channel}
                  </span>
                  <span className="mono-tag text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-ash-dim)' }}>
                    {a.audience}
                  </span>
                  <span className="mono-tag text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-ash-dim)' }}>
                    {a.language}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-bone-dim)' }}>{a.content}</p>
              </div>

              <span className="mono-tag text-[10px] shrink-0 tabular-nums" style={{ color: 'var(--color-ash-dim)' }}>
                {new Date(a.sentAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)' }}
              >
                <Bell size={24} style={{ color: 'var(--color-signal)', opacity: 0.5 }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--color-ash)' }}>No alerts broadcast yet.</span>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
