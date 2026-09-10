import { useState } from 'react';
import { Bell, Radio, Send, PhoneCall } from 'lucide-react';
import { Panel } from '../components/Panel';
import { useData } from '../context/DataContext';
import EmergencyCallPanel from '../components/EmergencyCallPanel';
import EmergencyToast from '../components/EmergencyToast';
import type { AlertChannel, AlertBroadcast } from '../types';

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

const CHANNELS: AlertChannel[] = ['SMS', 'PUSH_NOTIFICATION', 'APP_BANNER', 'EMAIL', 'PUBLIC_ANNOUNCEMENT'];
const AUDIENCES = ['Citizens', 'Government', 'NGOs', 'Hospitals', 'All'];
const LANGUAGES = ['English', 'Hindi', 'Tamil'];

let toastSeq = 1;

export default function Alerts() {
  const { alerts, addAlert } = useData();
  const sorted = [...alerts].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  // Broadcast form state
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [channel, setChannel] = useState<AlertChannel>('SMS');
  const [audience, setAudience] = useState('Citizens');
  const [language, setLanguage] = useState('English');
  const [sending, setSending] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<{ id: number; message: string; channel: string }[]>([]);

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function sendBroadcast() {
    if (!broadcastMsg.trim() || sending) return;
    setSending(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 700));

    const newAlert: AlertBroadcast = {
      id: `alert-broadcast-${Date.now()}`,
      channel,
      language,
      audience,
      content: broadcastMsg,
      sentAt: new Date().toISOString(),
    };

    addAlert(newAlert);

    // Show toast
    const toastId = toastSeq++;
    setToasts((prev) => [...prev, { id: toastId, message: broadcastMsg, channel: CHANNEL_LABELS[channel] ?? channel }]);

    setBroadcastMsg('');
    setSending(false);
  }

  return (
    <div className="p-6 space-y-6">

      {/* Toast notifications */}
      {toasts.map((t) => (
        <EmergencyToast
          key={t.id}
          message={t.message}
          channel={t.channel}
          onClose={() => removeToast(t.id)}
        />
      ))}

      {/* Page header */}
      <div className="flex items-center gap-4 animate-float-up">
        <div className="brand-logo w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <Bell size={18} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }} />
        </div>
        <div>
          <div className="mono-tag text-[11px] uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--color-signal)' }}>
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

      {/* Main grid: broadcast form + emergency contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Emergency Broadcast Form */}
        <div className="lg:col-span-2">
          <Panel eyebrow="Send Now" title="Emergency Broadcast">
            <div className="space-y-4">
              {/* Message textarea */}
              <div>
                <label className="mono-tag text-[10px] uppercase tracking-widest text-ash-dim mb-1.5 block">
                  Alert Message
                </label>
                <textarea
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. Flash flood warning issued — evacuate low-lying areas immediately via North Bridge…"
                  rows={3}
                  disabled={sending}
                  className="w-full input-light rounded-xl px-4 py-3 text-sm resize-none"
                  style={{ minHeight: 88 }}
                />
              </div>

              {/* Selectors row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mono-tag text-[10px] uppercase tracking-widest text-ash-dim mb-1.5 block">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as AlertChannel)}
                    className="w-full input-light rounded-xl px-3 py-2.5 text-sm"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono-tag text-[10px] uppercase tracking-widest text-ash-dim mb-1.5 block">
                    Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full input-light rounded-xl px-3 py-2.5 text-sm"
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono-tag text-[10px] uppercase tracking-widest text-ash-dim mb-1.5 block">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full input-light rounded-xl px-3 py-2.5 text-sm"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={sendBroadcast}
                disabled={!broadcastMsg.trim() || sending}
                className="btn-primary w-full flex items-center justify-center gap-2.5 font-display font-semibold px-5 py-3 rounded-xl text-sm"
              >
                {sending ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                    />
                    Broadcasting…
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send Emergency Alert
                  </>
                )}
              </button>

              {/* Channel preview badge */}
              {broadcastMsg && (
                <div className="flex items-center gap-2 animate-float-up">
                  <span className="mono-tag text-[9px] text-ash-dim uppercase">Preview channel:</span>
                  <span
                    className="mono-tag text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      ...(CHANNEL_COLORS[channel] ?? {}),
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {CHANNEL_LABELS[channel]} → {audience} · {language}
                  </span>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-4">
          <Panel eyebrow="Quick Dial" title="Emergency Lines">
            <div className="flex items-center gap-2 mb-3">
              <PhoneCall size={12} style={{ color: 'var(--color-signal)' }} />
              <span className="mono-tag text-[10px] text-ash-dim uppercase tracking-wider">
                One-tap calling on mobile
              </span>
            </div>
            <EmergencyCallPanel />
          </Panel>
        </div>
      </div>

      {/* Broadcast history */}
      <Panel padded={false}>
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <span className="mono-tag text-[11px] uppercase tracking-wider text-ash">Broadcast History</span>
          <span className="mono-tag text-[10px] text-ash-dim">{sorted.length} total</span>
        </div>
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
