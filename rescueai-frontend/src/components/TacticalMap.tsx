import { useState } from 'react';
import type { IncidentResponse, Hospital, ResourceItem } from '../types';
import { DEMO_BOUNDS } from '../lib/mock';

function project(lat: number, lng: number) {
  const x = ((lng - DEMO_BOUNDS.minLng) / (DEMO_BOUNDS.maxLng - DEMO_BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - DEMO_BOUNDS.minLat) / (DEMO_BOUNDS.maxLat - DEMO_BOUNDS.minLat)) * 100;
  return { x: Math.min(97, Math.max(3, x)), y: Math.min(96, Math.max(6, y)) };
}

const SEV_COLOR: Record<string, string> = {
  LOW: '#8b8b90',
  MODERATE: '#cfccc4',
  HIGH: '#e30613',
  CRITICAL: '#ff3b30',
};

export default function TacticalMap({
  incidents, hospitals = [], resources = [], onSelect, height = 460,
}: {
  incidents: IncidentResponse[];
  hospitals?: Hospital[];
  resources?: ResourceItem[];
  onSelect?: (i: IncidentResponse) => void;
  height?: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [layers, setLayers] = useState({ incidents: true, hospitals: true, resources: true, hazard: true });

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-3">
        {(['incidents', 'hazard', 'hospitals', 'resources'] as const).map((k) => (
          <label key={k} className="flex items-center gap-1.5 text-xs text-ash cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layers[k]}
              onChange={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
              className="accent-[#e30613] w-3.5 h-3.5"
            />
            <span className="mono-tag uppercase tracking-wide">{k}</span>
          </label>
        ))}
      </div>

      <div
        className="relative w-full rounded-sm border border-line grid-texture overflow-hidden bg-[#0d0d0f]"
        style={{ height }}
      >
        {/* radar sweep */}
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(227,6,19,0.18) 25deg, transparent 55deg)',
          animation: 'spin 6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* crosshair + range rings, centered */}
          <g opacity="0.35">
            <line x1="50" y1="0" x2="50" y2="100" stroke="#3a3a3f" strokeWidth="0.15" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#3a3a3f" strokeWidth="0.15" />
            {[15, 30, 45].map((r) => (
              <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#3a3a3f" strokeWidth="0.15" />
            ))}
          </g>

          {layers.hazard && incidents.filter((i) => i.severityLevel === 'HIGH' || i.severityLevel === 'CRITICAL').map((i) => {
            const { x, y } = project(i.latitude, i.longitude);
            const r = i.severityLevel === 'CRITICAL' ? 8 : 5;
            return (
              <circle key={`hz-${i.id}`} cx={x} cy={y} r={r} fill={SEV_COLOR[i.severityLevel ?? 'LOW']} opacity="0.08" />
            );
          })}

          {layers.resources && resources.filter((r) => r.latitude && r.longitude).map((r) => {
            const { x, y } = project(r.latitude!, r.longitude!);
            return (
              <rect key={r.id} x={x - 0.6} y={y - 0.6} width="1.2" height="1.2" fill="#8b8b90" opacity="0.8"
                transform={`rotate(45 ${x} ${y})`} />
            );
          })}

          {layers.hospitals && hospitals.filter((h) => h.latitude && h.longitude).map((h) => {
            const { x, y } = project(h.latitude!, h.longitude!);
            return (
              <g key={h.id}>
                <line x1={x - 1.4} y1={y} x2={x + 1.4} y2={y} stroke="#f3f1ec" strokeWidth="0.35" />
                <line x1={x} y1={y - 1.4} x2={x} y2={y + 1.4} stroke="#f3f1ec" strokeWidth="0.35" />
              </g>
            );
          })}

          {layers.incidents && incidents.map((i) => {
            const { x, y } = project(i.latitude, i.longitude);
            const color = SEV_COLOR[i.severityLevel ?? 'LOW'];
            const isHot = i.severityLevel === 'CRITICAL' || i.severityLevel === 'HIGH';
            return (
              <g
                key={i.id}
                onMouseEnter={() => setHovered(i.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(i)}
                className="cursor-pointer"
              >
                {isHot && <circle cx={x} cy={y} r="2.2" fill="none" stroke={color} strokeWidth="0.3" opacity="0.7">
                  <animate attributeName="r" values="1.5;4;1.5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>}
                <circle cx={x} cy={y} r={hovered === i.id ? 1.6 : 1.1} fill={color} stroke="#0a0a0a" strokeWidth="0.3" />
              </g>
            );
          })}
        </svg>

        {/* hover tooltip */}
        {hovered && (() => {
          const inc = incidents.find((i) => i.id === hovered);
          if (!inc) return null;
          const { x, y } = project(inc.latitude, inc.longitude);
          return (
            <div
              className="absolute z-10 pointer-events-none bg-charcoal border border-line-bright rounded-sm px-3 py-2 text-xs shadow-lg"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -130%)' }}
            >
              <div className="font-display font-semibold text-bone">{inc.type?.replace(/_/g, ' ')}</div>
              <div className="mono-tag text-ash-dim">{inc.description}</div>
              <div className="mono-tag mt-1" style={{ color: SEV_COLOR[inc.severityLevel ?? 'LOW'] }}>
                SEV {inc.severityScore} · {inc.severityLevel}
              </div>
            </div>
          );
        })()}

        {/* corner readout */}
        <div className="absolute bottom-3 left-3 mono-tag text-[10px] text-ash-dim uppercase tracking-widest">
          GRID {DEMO_BOUNDS.minLat.toFixed(2)}N / {DEMO_BOUNDS.minLng.toFixed(2)}E
        </div>
        <div className="absolute bottom-3 right-3 mono-tag text-[10px] text-ash-dim uppercase tracking-widest">
          {incidents.length} TRACKED
        </div>
      </div>
    </div>
  );
}
