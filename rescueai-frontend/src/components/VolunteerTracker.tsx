import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Crosshair, X, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function VolunteerTracker() {
  const { myLocation, setMyLocation } = useData();
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  function startTracking() {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported in this browser.');
      return;
    }
    setError(null);
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setAccuracy(Math.round(pos.coords.accuracy));
        setError(null);
      },
      (err) => {
        setError(err.code === 1 ? 'Location permission denied.' : 'Unable to get location.');
        setTracking(false);
        setMyLocation(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setMyLocation(null);
    setAccuracy(null);
    setError(null);
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: tracking
          ? 'linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(29,78,216,0.04) 100%)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${tracking ? 'rgba(37,99,235,0.25)' : 'rgba(220,38,38,0.12)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {tracking ? (
          <span
            className="w-2 h-2 rounded-full animate-pulse shrink-0"
            style={{ background: '#2563eb', boxShadow: '0 0 6px rgba(37,99,235,0.8)' }}
          />
        ) : (
          <Crosshair size={12} style={{ color: 'var(--color-ash)' }} />
        )}
        <span
          className="mono-tag text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: tracking ? '#2563eb' : 'var(--color-ash)' }}
        >
          {tracking ? 'GPS Active' : 'My Location'}
        </span>
      </div>

      {/* Coords display */}
      {myLocation && (
        <div
          className="rounded-lg px-3 py-2 font-mono text-[11px] space-y-0.5"
          style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.15)' }}
        >
          <div className="flex items-center gap-1.5">
            <MapPin size={9} style={{ color: '#2563eb' }} />
            <span style={{ color: '#2563eb' }}>
              {myLocation.lat.toFixed(5)}N, {myLocation.lng.toFixed(5)}E
            </span>
          </div>
          {accuracy && (
            <div className="mono-tag text-[9px]" style={{ color: 'var(--color-ash-dim)' }}>
              Accuracy: ±{accuracy}m
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px]"
          style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.15)', color: '#dc2626' }}
        >
          <AlertCircle size={11} />
          {error}
        </div>
      )}

      {/* Toggle button */}
      {tracking ? (
        <button
          onClick={stopTracking}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-display font-semibold transition-all hover:opacity-90"
          style={{
            background: 'rgba(220,38,38,0.1)',
            color: '#dc2626',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <X size={13} />
          Stop Sharing Location
        </button>
      ) : (
        <button
          onClick={startTracking}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-display font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            color: 'white',
            border: '1px solid rgba(37,99,235,0.4)',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
          }}
        >
          <Navigation size={13} />
          Share My Location
        </button>
      )}

      <p className="mono-tag text-[9px] text-center" style={{ color: 'var(--color-ash-dim)' }}>
        {tracking ? 'Your position shown as blue dot on map' : 'Appears as blue dot on Live Map'}
      </p>
    </div>
  );
}
