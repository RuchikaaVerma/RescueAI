import { useRef, useState, useEffect } from 'react';
import { Bell, BellRing, X, AlertTriangle, Radio, Package, Info, CheckCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { AppNotification } from '../types';

const TYPE_CONFIG = {
  CRITICAL_INCIDENT: { icon: AlertTriangle, color: '#ff3b30', bg: 'rgba(255,59,48,0.08)' },
  ALERT_SENT:        { icon: Radio,         color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  RESOURCE_UPDATE:   { icon: Package,       color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  SYSTEM:            { icon: Info,          color: '#8b8b90', bg: 'rgba(139,139,144,0.08)' },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifItem({ n }: { n: AppNotification }) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-black/[0.03]"
      style={{
        borderBottom: '1px solid rgba(220,38,38,0.07)',
        background: n.read ? 'transparent' : 'rgba(220,38,38,0.025)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
      >
        <Icon size={13} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--color-bone)' }}>
            {n.title}
          </p>
          {!n.read && (
            <span
              className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
              style={{ background: '#dc2626', boxShadow: '0 0 4px rgba(220,38,38,0.6)' }}
            />
          )}
        </div>
        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--color-ash)' }}>
          {n.body}
        </p>
        <span className="mono-tag text-[9px]" style={{ color: 'var(--color-ash-dim)' }}>
          {timeAgo(n.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const { notifications, unreadCount, markAllRead } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle() {
    setOpen((o) => {
      if (!o && unreadCount > 0) markAllRead();
      return !o;
    });
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={toggle}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{
          background: open ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.6)',
          border: `1px solid ${open ? 'rgba(220,38,38,0.25)' : 'rgba(220,38,38,0.12)'}`,
          boxShadow: open ? '0 0 12px rgba(220,38,38,0.2)' : 'none',
        }}
        title="Notifications"
      >
        {unreadCount > 0
          ? <BellRing size={15} style={{ color: 'var(--color-signal)' }} className="animate-[wiggle_0.5s_ease-in-out]" />
          : <Bell size={15} style={{ color: 'var(--color-ash)' }} />
        }
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center mono-tag text-[8px] font-bold text-white px-1"
            style={{ background: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.5)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-12 z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 360,
            maxHeight: 520,
            background: 'rgba(255,255,255,0.97)',
            border: '1px solid rgba(220,38,38,0.14)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(220,38,38,0.08)',
            animation: 'float-up 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(220,38,38,0.1)', background: 'rgba(255,255,255,0.9)' }}
          >
            <div className="flex items-center gap-2">
              <Bell size={13} style={{ color: 'var(--color-signal)' }} />
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-bone)' }}>
                Notifications
              </span>
              {notifications.length > 0 && (
                <span
                  className="mono-tag text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--color-signal)' }}
                >
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] mono-tag px-2 py-1 rounded-lg transition-all hover:bg-gray-100"
                  style={{ color: 'var(--color-ash)' }}
                >
                  <CheckCheck size={11} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
                style={{ color: 'var(--color-ash)' }}
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 430 }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Bell size={28} style={{ color: 'var(--color-ash-dim)', opacity: 0.4 }} />
                <span className="mono-tag text-[11px]" style={{ color: 'var(--color-ash-dim)' }}>
                  No notifications yet
                </span>
              </div>
            ) : (
              notifications.map((n) => <NotifItem key={n.id} n={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
