import { useEffect, useState } from 'react';
import { Wind, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchWeather, assessDisasterRisk, windDirection, type WeatherData } from '../lib/weather';

const RISK_COLORS = {
  LOW:      { bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.2)',  text: '#16a34a' },
  MODERATE: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#d97706' },
  HIGH:     { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',  text: '#dc2626' },
  CRITICAL: { bg: 'rgba(255,59,48,0.12)',  border: 'rgba(255,59,48,0.3)',  text: '#ff3b30' },
};

// Map OWM icon codes to emojis for display
function weatherEmoji(icon: string): string {
  if (icon.startsWith('01')) return '☀️';
  if (icon.startsWith('02')) return '⛅';
  if (icon.startsWith('03') || icon.startsWith('04')) return '☁️';
  if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️';
  if (icon.startsWith('11')) return '⛈️';
  if (icon.startsWith('13')) return '❄️';
  if (icon.startsWith('50')) return '🌫️';
  return '🌤️';
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true);
    try {
      const data = await fetchWeather();
      setWeather(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // Refresh every 10 minutes
    const t = setInterval(() => load(), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220,38,38,0.1)' }}>
        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
        <div className="space-y-1">
          <div className="w-16 h-3 rounded bg-gray-200 animate-pulse" />
          <div className="w-24 h-2 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { risk, reason } = assessDisasterRisk(weather);
  const colors = RISK_COLORS[risk];

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
      title={`${weather.location} · ${weather.description} · Risk: ${risk}`}
    >
      {/* Weather emoji */}
      <div className="text-2xl leading-none shrink-0" role="img" aria-label={weather.description}>
        {weatherEmoji(weather.icon)}
      </div>

      {/* Temperature + condition */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-sm" style={{ color: 'var(--color-bone)' }}>
            {weather.temp}°C
          </span>
          <span
            className="mono-tag text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {risk} RISK
          </span>
        </div>
        <div className="mono-tag text-[10px] capitalize" style={{ color: 'var(--color-ash-dim)' }}>
          {weather.description} · {reason}
        </div>
      </div>

      {/* Quick stats */}
      <div className="hidden lg:flex items-center gap-3 ml-1 pl-3" style={{ borderLeft: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-1" title={`Wind: ${weather.windSpeed} m/s ${windDirection(weather.windDeg)}`}>
          <Wind size={10} style={{ color: colors.text }} />
          <span className="mono-tag text-[10px]" style={{ color: 'var(--color-ash)' }}>
            {weather.windSpeed.toFixed(1)}m/s {windDirection(weather.windDeg)}
          </span>
        </div>
        <div className="flex items-center gap-1" title={`Humidity: ${weather.humidity}%`}>
          <Droplets size={10} style={{ color: colors.text }} />
          <span className="mono-tag text-[10px]" style={{ color: 'var(--color-ash)' }}>
            {weather.humidity}%
          </span>
        </div>
        {risk === 'HIGH' || risk === 'CRITICAL' ? (
          <AlertTriangle size={12} style={{ color: colors.text }} className="animate-pulse" />
        ) : null}
      </div>

      {/* Refresh button */}
      <button
        onClick={() => load(true)}
        className="ml-1 p-1 rounded-lg transition-all hover:bg-white/10"
        style={{ color: 'var(--color-ash-dim)' }}
        title="Refresh weather"
      >
        <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
      </button>

      {weather.isDemo && (
        <span className="mono-tag text-[8px] text-ash-dim hidden xl:inline">DEMO</span>
      )}
    </div>
  );
}
