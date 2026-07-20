import { type ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Activity, Hospital, Users, Package,
  BarChart3, Bell, Radio, ChevronLeft,
} from 'lucide-react';
import { useData } from '../context/DataContext';

const NAV = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/map', label: 'Live Map', icon: MapPin },
  { to: '/incidents', label: 'Incident Timeline', icon: Activity },
  { to: '/hospitals', label: 'Hospitals', icon: Hospital },
  { to: '/volunteers', label: 'Volunteers', icon: Users },
  { to: '/resources', label: 'Resources', icon: Package },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
];

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="mono-tag text-xs" style={{ color: 'var(--color-ash)' }}>
      {now.toUTCString().slice(17, 25)} UTC
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { mode, wsState } = useData();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--color-void)' }}>
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Sidebar */}
      <aside
        className={`shrink-0 flex flex-col relative z-10 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
          borderRight: '1px solid var(--color-rose-border)',
          boxShadow: '2px 0 12px rgba(220,38,38,0.06)',
        }}
      >
        {/* Brand */}
        <div
          className="h-16 flex items-center gap-2.5 px-4 relative overflow-hidden"
          style={{ borderBottom: '1px solid var(--color-rose-border)' }}
        >
          {/* Animated brand background sweep */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, transparent 60%)',
            }}
          />
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
            }}
          >
            <Radio size={17} className="text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden relative">
              <div
                className="font-display font-bold text-[15px] tracking-wide"
                style={{ color: 'var(--color-bone)' }}
              >
                RESCUE<span style={{ color: 'var(--color-signal)' }}>AI</span>
              </div>
              <div
                className="mono-tag text-[9px] uppercase"
                style={{ color: 'var(--color-ash-dim)', letterSpacing: '0.15em' }}
              >
                Command OS
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV.map(({ to, label, icon: Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ animationDelay: `${i * 40}ms` }}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative animate-float-up ${
                  isActive
                    ? 'nav-active-glow'
                    : 'hover:bg-rose-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.04))',
                        border: '1px solid rgba(220,38,38,0.15)',
                      }}
                    />
                  )}
                  <Icon
                    size={17}
                    className="shrink-0 relative z-10 transition-colors duration-200"
                    style={{ color: isActive ? 'var(--color-signal)' : 'var(--color-ash)' }}
                  />
                  {!collapsed && (
                    <span
                      className="truncate relative z-10 font-medium"
                      style={{ color: isActive ? 'var(--color-signal)' : 'var(--color-bone)' }}
                    >
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-11 flex items-center justify-center transition-all duration-200 group"
          style={{
            borderTop: '1px solid var(--color-rose-border)',
            color: 'var(--color-ash)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-signal)'; e.currentTarget.style.background = 'var(--color-rose-light)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ash)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top header */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-6 backdrop-blur-sm"
          style={{
            background: 'rgba(255,255,255,0.85)',
            borderBottom: '1px solid var(--color-rose-border)',
            boxShadow: '0 1px 8px rgba(220,38,38,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="pulse-dot ping-live" />
            <span
              className="mono-tag text-xs uppercase tracking-wider"
              style={{ color: 'var(--color-bone-dim)' }}
            >
              {mode === 'live' ? 'Live Backend' : 'Demo Simulation'}
            </span>
            <span style={{ color: 'var(--color-ash-dim)' }}>·</span>
            <span
              className={`mono-tag text-xs uppercase tracking-wider font-semibold`}
              style={{ color: wsState === 'connected' ? 'var(--color-signal)' : 'var(--color-ash)' }}
            >
              WS {wsState}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Clock />
            <div className="h-6 w-px" style={{ background: 'var(--color-line)' }} />
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mono-tag text-xs text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}
              >
                CC
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-sm font-semibold" style={{ color: 'var(--color-bone)' }}>Command Center</div>
                <div className="mono-tag text-[10px]" style={{ color: 'var(--color-ash-dim)' }}>
                  Tenant: Coastal District
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
