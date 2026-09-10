import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IncidentResponse, Hospital, ResourceItem } from '../types';
import { useData } from '../context/DataContext';

// Fix Leaflet's broken default icon path in Vite/webpack builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEV_COLOR: Record<string, string> = {
  LOW: '#8b8b90',
  MODERATE: '#f59e0b',
  HIGH: '#e30613',
  CRITICAL: '#ff3b30',
};

function makeIncidentIcon(severityLevel: string | null) {
  const color = SEV_COLOR[severityLevel ?? 'LOW'];
  const isPulsing = severityLevel === 'CRITICAL' || severityLevel === 'HIGH';
  const size = severityLevel === 'CRITICAL' ? 18 : severityLevel === 'HIGH' ? 15 : 12;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}">
      ${isPulsing ? `<circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${(size + 8) / 2 - 1}" fill="${color}" opacity="0.25">
        <animate attributeName="r" values="${(size + 8) / 2 - 4};${(size + 8) / 2 - 1};${(size + 8) / 2 - 4}" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite"/>
      </circle>` : ''}
      <circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2}" fill="${color}" stroke="#0a0a0a" stroke-width="2"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
}

const hospitalIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <rect x="1" y="1" width="20" height="20" rx="4" fill="#1a1a1f" stroke="#f3f1ec" stroke-width="1.5"/>
    <line x1="11" y1="5" x2="11" y2="17" stroke="#f3f1ec" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="5" y1="11" x2="17" y2="11" stroke="#f3f1ec" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const resourceIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
    <rect x="2" y="2" width="10" height="10" fill="#8b8b90" stroke="#0a0a0a" stroke-width="1.5" transform="rotate(45 7 7)"/>
  </svg>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function TacticalMap({
  incidents, hospitals = [], resources = [], onSelect, height = 460,
}: {
  incidents: IncidentResponse[];
  hospitals?: Hospital[];
  resources?: ResourceItem[];
  onSelect?: (i: IncidentResponse) => void;
  height?: number;
}) {
  const { myLocation } = useData();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const myMarkerRef = useRef<L.Layer | null>(null);
  const [layers, setLayers] = useState({ incidents: true, hospitals: true, resources: true });

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [13.05, 80.225],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update markers when data or layer visibility changes
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Incident markers
    if (layers.incidents) {
      incidents.forEach((inc) => {
        const marker = L.marker([inc.latitude, inc.longitude], {
          icon: makeIncidentIcon(inc.severityLevel),
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 200px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1a1a1f;">
              ${inc.type?.replace(/_/g, ' ') ?? 'Unclassified'}
            </div>
            <div style="font-size: 12px; color: #555; margin-bottom: 8px; line-height: 1.4;">
              ${inc.description ?? '—'}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 6px;">
              <span style="background: ${SEV_COLOR[inc.severityLevel ?? 'LOW']}22; color: ${SEV_COLOR[inc.severityLevel ?? 'LOW']}; border: 1px solid ${SEV_COLOR[inc.severityLevel ?? 'LOW']}55; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                ${inc.severityLevel ?? 'Unknown'}
              </span>
              <span style="background: #f3f1ec22; color: #555; border: 1px solid #ddd; padding: 2px 8px; border-radius: 999px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;">
                ${inc.status}
              </span>
            </div>
            <div style="font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 6px;">
              Severity Score: <strong>${inc.severityScore ?? '—'}/10</strong> &nbsp;·&nbsp;
              Spread: <strong>${inc.predictedSpreadRadiusM ? inc.predictedSpreadRadiusM + 'm' : '—'}</strong>
            </div>
            <div style="font-size: 10px; color: #aaa; margin-top: 4px;">
              ${inc.latitude.toFixed(5)}N, ${inc.longitude.toFixed(5)}E
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${inc.latitude},${inc.longitude}" 
               target="_blank" rel="noopener noreferrer"
               style="display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; background: #1d4ed8; color: white; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
              🧭 Navigate Here
            </a>
          </div>`;

        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.on('click', () => onSelect?.(inc));
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }

    // Hospital markers
    if (layers.hospitals) {
      hospitals.filter((h) => h.latitude && h.longitude).forEach((h) => {
        const marker = L.marker([h.latitude!, h.longitude!], { icon: hospitalIcon });
        const loadPct = Math.round((h.currentLoad / h.capacity) * 100);
        const loadColor = loadPct > 85 ? '#dc2626' : loadPct > 65 ? '#f59e0b' : '#16a34a';
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">🏥 ${h.name}</div>
            <div style="font-size: 11px; color: #555; margin-bottom: 6px;">
              Specialties: ${h.specialties ?? '—'}
            </div>
            <div style="font-size: 11px; margin-bottom: 4px;">
              Capacity: <strong>${h.currentLoad}/${h.capacity}</strong>
              <span style="color: ${loadColor}; font-weight: 700; margin-left: 4px;">${loadPct}%</span>
            </div>
            <div style="font-size: 10px; color: #888;">${h.bloodBankLevels ?? ''}</div>
          </div>`, { maxWidth: 240 });
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }

    // Resource markers
    if (layers.resources) {
      resources.filter((r) => r.latitude && r.longitude).forEach((r) => {
        const marker = L.marker([r.latitude!, r.longitude!], { icon: resourceIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif;">
            <div style="font-weight: 600; font-size: 12px;">${r.type.replace(/_/g, ' ')}</div>
            <div style="font-size: 11px; color: #555; margin-top: 2px;">
              Status: ${r.status} &nbsp;·&nbsp; Qty: ${r.quantity}
            </div>
          </div>`);
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [incidents, hospitals, resources, layers, onSelect]);

  // Update volunteer GPS marker
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    if (myMarkerRef.current) {
      map.removeLayer(myMarkerRef.current);
      myMarkerRef.current = null;
    }
    if (myLocation) {
      const meIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="rgba(37,99,235,0.15)" stroke="#2563eb" stroke-width="1.5">
            <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="12" cy="12" r="5" fill="#2563eb" stroke="white" stroke-width="2"/>
        </svg>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([myLocation.lat, myLocation.lng], { icon: meIcon, zIndexOffset: 1000 });
      marker.bindPopup(`<div style="font-family:system-ui;font-size:12px;"><b>📍 My Location</b><br/>${myLocation.lat.toFixed(5)}N, ${myLocation.lng.toFixed(5)}E${myLocation.accuracy ? `<br/>±${Math.round(myLocation.accuracy)}m accuracy` : ''}</div>`);
      marker.addTo(map);
      myMarkerRef.current = marker;
    }
  }, [myLocation]);

  return (
    <div className="relative">
      {/* Layer toggles */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        {(['incidents', 'hospitals', 'resources'] as const).map((k) => (
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
        <span className="ml-auto mono-tag text-[10px] text-ash-dim uppercase tracking-widest">
          Live OpenStreetMap
        </span>
      </div>

      {/* Leaflet map container */}
      <div
        ref={mapRef}
        className="w-full rounded-sm border border-line overflow-hidden"
        style={{ height, zIndex: 0 }}
      />

      {/* Corner badge */}
      <div className="absolute bottom-2 left-2 z-[1000] pointer-events-none">
        <span className="mono-tag text-[9px] uppercase tracking-widest bg-[#0d0d0fcc] text-ash-dim px-2 py-0.5 rounded">
          {incidents.length} incidents tracked
        </span>
      </div>
    </div>
  );
}
