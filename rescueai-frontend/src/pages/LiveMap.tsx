import { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Panel } from '../components/Panel';
import TacticalMap from '../components/TacticalMap';
import EmergencyCallPanel from '../components/EmergencyCallPanel';
import VolunteerTracker from '../components/VolunteerTracker';
import { SeverityBadge, StatusPill } from '../components/Badges';
import { useData } from '../context/DataContext';
import type { IncidentResponse } from '../types';

export default function LiveMap() {
  const { incidents, hospitals, resources } = useData();
  const [selected, setSelected] = useState<IncidentResponse | null>(null);

  function openNavigation(lat: number, lng: number) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="mono-tag text-[11px] uppercase tracking-[0.2em] text-signal-bright mb-1">Situational Awareness</div>
        <h1 className="font-display font-bold text-2xl text-bone">Live Disaster Map</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map — 3/4 width */}
        <div className="xl:col-span-3">
          <Panel
            padded={false}
            title="Tactical Overview"
            right={
              <span className="mono-tag text-[10px] text-ash uppercase">
                {incidents.length} tracked · {hospitals.length} facilities
              </span>
            }
          >
            <div className="p-5">
              <TacticalMap
                incidents={incidents}
                hospitals={hospitals}
                resources={resources}
                onSelect={setSelected}
                height={620}
              />
            </div>
          </Panel>
        </div>

        {/* Sidebar — 1/4 width */}
        <div className="space-y-4">

          {/* Incident detail / legend */}
          <Panel eyebrow={selected ? 'Selected' : 'Legend'} title={selected ? 'Incident Detail' : 'Map Key'}>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <div className="font-display font-semibold text-lg text-bone">{selected.type?.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-ash mt-1">{selected.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge level={selected.severityLevel} />
                  <StatusPill status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-line">
                  <div>
                    <div className="text-ash-dim mono-tag uppercase text-[10px]">Severity Score</div>
                    <div className="text-bone font-display font-semibold text-base">{selected.severityScore ?? '—'}/10</div>
                  </div>
                  <div>
                    <div className="text-ash-dim mono-tag uppercase text-[10px]">Confidence</div>
                    <div className="text-bone font-display font-semibold text-base">
                      {selected.verificationConfidence ? `${(selected.verificationConfidence * 100).toFixed(0)}%` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-ash-dim mono-tag uppercase text-[10px]">Spread Radius</div>
                    <div className="text-bone font-display font-semibold text-base">
                      {selected.predictedSpreadRadiusM ? `${selected.predictedSpreadRadiusM}m` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-ash-dim mono-tag uppercase text-[10px]">Reported</div>
                    <div className="text-bone font-display font-semibold text-base">
                      {new Date(selected.reportedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="mono-tag text-[10px] text-ash-dim pt-2 border-t border-line flex items-center gap-1.5">
                  <MapPin size={10} />
                  {selected.latitude.toFixed(4)}N, {selected.longitude.toFixed(4)}E
                </div>

                {/* Navigate button */}
                <button
                  onClick={() => openNavigation(selected.latitude, selected.longitude)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-display font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: 'white',
                    border: '1px solid rgba(37,99,235,0.4)',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}
                >
                  <Navigation size={14} />
                  Navigate to Incident
                  <ExternalLink size={11} style={{ opacity: 0.7 }} />
                </button>

                <button
                  onClick={() => setSelected(null)}
                  className="w-full text-xs text-ash-dim hover:text-ash transition-colors py-1 mono-tag"
                >
                  ← Back to legend
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <LegendRow color="#ff3b30" label="Critical incident" />
                <LegendRow color="#e30613" label="High severity" />
                <LegendRow color="#f59e0b" label="Moderate severity" />
                <LegendRow color="#8b8b90" label="Low severity" />
                <div className="pt-2 border-t border-line space-y-2">
                  <div className="flex items-center gap-2 text-ash text-xs">
                    <span className="text-base leading-none">🏥</span> Hospital / medical facility
                  </div>
                  <div className="flex items-center gap-2 text-ash text-xs">
                    <span className="inline-block w-2 h-2 bg-ash rotate-45" /> Resource unit position
                  </div>
                </div>
                <p className="text-ash-dim text-xs pt-2 border-t border-line">
                  Click any marker on the map to inspect details and navigate.
                </p>
              </div>
            )}
          </Panel>

          {/* Volunteer GPS Tracker */}
          <Panel eyebrow="Field Ops" title="My Location">
            <VolunteerTracker />
          </Panel>

          {/* Emergency Call Panel */}
          <Panel eyebrow="One-tap Dial" title="Emergency Lines">
            <EmergencyCallPanel />
          </Panel>

        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-ash text-xs">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
