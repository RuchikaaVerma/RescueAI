import { type ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Activity, Hospital, Users, Package,
  BarChart3, Bell, Radio, ChevronLeft, BellOff,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import NotificationCenter from './NotificationCenter';
import WeatherWidget from './WeatherWidget';
import { requestNotificationPermission } from '../lib/notifications';

const NAV = [
  { to: '/',          label: 'Command Center',    icon: LayoutDashboard, end: true },
  { to: '/map',       label: 'Live Map',          icon: MapPin },
  { to: '/incidents', label: 'Incident Timeline', icon: Activity },
  { to: '/hospitals', label: 'Hospitals',         icon: Hospital },
  { to: '/volunteers',label: 'Volunteers',        icon: Users },
  { to: '/resources', label: 'Resources',         icon: Package },
  { to: '/analytics', label: 'Analytics',         icon: BarChart3 },
  { to: '/alerts',    label: 'Alerts',            icon: Bell },
];

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="mono-tag text-xs tabular-nums" style={{ color: 'var(--color-ash)' }}>
      {now.toUTCString().slice(17, 25)}{' '}
      <span style={{ color: 'var(--color-ash-dim)' }}>UTC</span>
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { mode, wsState, notificationPermission } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  // Show notification prompt after 3 seconds if permission not yet decided
  useEffect(() => {
    const t = setTimeout(() => {
      if (notificationPermission === 'default') setShowNotifPrompt(true);
    }, 3000);
    return () => clearTimeout(t);
  }, [notificationPermission]);

  async function enableNotifications() {
    setShowNotifPrompt(false);
    await requestNotificationPermission();
  }

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--color-void)' }}>

      {/* ── Animated background layer ── */}
      <div className="animated-bg" />
      <div className="mesh-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className={`shrink-0 flex flex-col relative z-20 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
        style={{
          background: 'rgba(255,255,255,0.93)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          borderRight: '1px solid rgba(220,38,38,0.14)',
          boxShadow: '4px 0 32px rgba(220,38,38,0.07)',
        }}
      >
        {/* ── Brand header ── */}
        <div
          className="h-16 flex items-center gap-3 px-4 relative overflow-hidden shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, transparent 60%)',
            borderBottom: '1px solid rgba(220,38,38,0.12)',
          }}
        >
          {/* Animated sweep on brand */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.04), transparent)',
              animation: 'scan-line 5s linear infinite',
            }}
          />

          {/* Logo mark */}
          <div
            className="brand-logo w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
          >
            <Radio size={17} className="text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            {/* Rotating ring */}
            <div
              className="absolute inset-[-4px] rounded-xl border border-red-400 opacity-30 spin-slow"
              style={{ borderStyle: 'dashed' }}
            />
          </div>

          {!collapsed && (
            <div className="leading-tight overflow-hidden relative animate-fade-in">
              <div
                className="font-display font-bold text-[15px] tracking-wide"
                style={{ color: 'var(--color-bone)' }}
              >
                RESCUE<span className="text-shimmer-red">AI</span>
              </div>
              <div
                className="mono-tag text-[9px] uppercase"
                style={{ color: 'var(--color-ash-dim)', letterSpacing: '0.18em' }}
              >
                Command OS
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ animationDelay: `${i * 45}ms` }}
              className={({ isActive }) =>
                `nav-item-sweep group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                 transition-all duration-200 relative animate-float-up ${
                   isActive ? 'nav-active-glow' : ''
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active background */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(220,38,38,0.09), rgba(220,38,38,0.04))',
                        border: '1px solid rgba(220,38,38,0.18)',
                      }}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    size={17}
                    className="shrink-0 relative z-10 transition-all duration-200"
                    style={{
                      color: isActive ? 'var(--color-signal)' : 'var(--color-ash)',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(220,38,38,0.35))' : 'none',
                    }}
                  />

                  {/* Label */}
                  {!collapsed && (
                    <span
                      className="truncate relative z-10 font-medium transition-colors duration-200"
                      style={{ color: isActive ? 'var(--color-signal)' : 'var(--color-bone-dim)' }}
                    >
                      {label}
                    </span>
                  )}

                  {/* Active right dot */}
                  {isActive && (
                    <span
                      className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: 'var(--color-signal)', boxShadow: '0 0 6px rgba(220,38,38,0.6)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Collapse button ── */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-11 flex items-center justify-center transition-all duration-200 group shrink-0"
          style={{
            borderTop: '1px solid rgba(220,38,38,0.1)',
            color: 'var(--color-ash)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-signal)';
            e.currentTarget.style.background = 'rgba(220,38,38,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-ash)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* ── Top header ── */}
        <header
          className="header-glass h-16 shrink-0 flex items-center justify-between px-6 relative"
        >
          {/* Left: status */}
          <div className="flex items-center gap-3">
            <span className="pulse-dot ping-live" />
            <span
              className="mono-tag text-xs uppercase tracking-wider"
              style={{ color: 'var(--color-bone-dim)' }}
            >
              {mode === 'live' ? 'Live Backend' : 'Demo Simulation'}
            </span>
            <span style={{ color: 'var(--color-line-bright)' }}>|</span>
            <span
              className="mono-tag text-xs uppercase tracking-wider font-semibold"
              style={{ color: wsState === 'connected' ? 'var(--color-signal)' : 'var(--color-ash)' }}
            >
              WS{' '}
              <span
                style={{
                  color: wsState === 'connected' ? 'var(--color-signal)' : 'var(--color-ash-dim)',
                  textShadow: wsState === 'connected' ? '0 0 8px rgba(220,38,38,0.4)' : 'none',
                }}
              >
                {wsState}
              </span>
            </span>
          </div>

          {/* Right: weather + notif + clock + avatar */}
          <div className="flex items-center gap-3">
            <WeatherWidget />
            <div className="h-6 w-px" style={{ background: 'rgba(220,38,38,0.15)' }} />
            <NotificationCenter />
            {showNotifPrompt && notificationPermission === 'default' && (
              <button
                onClick={enableNotifications}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] mono-tag transition-all hover:scale-105"
                style={{
                  background: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  color: '#2563eb',
                }}
                title="Enable push notifications for critical alerts"
              >
                <Bell size={11} />
                Enable Alerts
              </button>
            )}
            {notificationPermission === 'denied' && (
              <div className="hidden sm:flex items-center gap-1 text-[10px] mono-tag" style={{ color: 'var(--color-ash-dim)' }} title="Notifications blocked in browser settings">
                <BellOff size={10} />
              </div>
            )}
            <div className="h-6 w-px" style={{ background: 'rgba(220,38,38,0.15)' }} />
            <Clock />
            <div className="h-6 w-px" style={{ background: 'rgba(220,38,38,0.15)' }} />
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mono-tag text-xs text-white font-bold relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  boxShadow: '0 2px 10px rgba(220,38,38,0.35)',
                }}
              >
                <span className="relative z-10">CC</span>
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' }}
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-sm font-semibold" style={{ color: 'var(--color-bone)' }}>
                  Command Center
                </div>
                <div className="mono-tag text-[10px]" style={{ color: 'var(--color-ash-dim)' }}>
                  Tenant: Coastal District
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
