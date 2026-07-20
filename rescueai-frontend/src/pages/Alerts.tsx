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
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
          }}
        >
          <Bell size={18} className="text-white" />
        </div>
        <div>
          <div
            className="mono-tag text-[11px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-signal)' }}
          >
            Communication Agent Output
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
            Real-time Alerts
          </h1>
        </div>
      </div>

      <Panel padded={false}>
        <div className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
          {sorted.map((a, idx) => (
            <div
              key={a.id}
              className="px-5 py-4 flex items-start gap-4 row-hover animate-float-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
              >
                <Radio size={14} style={{ color: 'var(--color-signal)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="mono-tag text-[9px] uppercase tracking-widest px-2 py-1 rounded-full font-semibold"
                    style={CHANNEL_COLORS[a.channel] ?? { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }}
                  >
                    {CHANNEL_LABELS[a.channel] ?? a.channel}
                  </span>
                  <span
                    className="mono-tag text-[9px] uppercase tracking-widest"
                    style={{ color: 'var(--color-ash-dim)' }}
                  >
                    {a.audience}
                  </span>
                  <span
                    className="mono-tag text-[9px] uppercase tracking-widest"
                    style={{ color: 'var(--color-ash-dim)' }}
                  >
                    {a.language}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-bone-dim)' }}>{a.content}</p>
              </div>
              <span
                className="mono-tag text-[10px] shrink-0"
                style={{ color: 'var(--color-ash-dim)' }}
              >
                {new Date(a.sentAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="text-center text-sm py-16" style={{ color: 'var(--color-ash)' }}>
              No alerts broadcast yet.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
