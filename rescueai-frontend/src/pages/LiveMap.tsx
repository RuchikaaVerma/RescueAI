import { useState } from 'react';
import { Panel } from '../components/Panel';
import TacticalMap from '../components/TacticalMap';
import { SeverityBadge, StatusPill } from '../components/Badges';
import { useData } from '../context/DataContext';
import type { IncidentResponse } from '../types';

export default function LiveMap() {
  const { incidents, hospitals, resources } = useData();
  const [selected, setSelected] = useState<IncidentResponse | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="mono-tag text-[11px] uppercase tracking-[0.2em] text-signal-bright mb-1">Situational Awareness</div>
        <h1 className="font-display font-bold text-2xl text-bone">Live Disaster Map</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Panel padded={false} title="Tactical Overview" right={<span className="mono-tag text-[10px] text-ash uppercase">{incidents.length} tracked · {hospitals.length} facilities</span>}>
            <div className="p-5">
              <TacticalMap incidents={incidents} hospitals={hospitals} resources={resources} onSelect={setSelected} height={620} />
            </div>
          </Panel>
        </div>

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
                  <div className="text-bone font-display font-semibold text-base">{selected.verificationConfidence ? `${(selected.verificationConfidence * 100).toFixed(0)}%` : '—'}</div>
                </div>
                <div>
                  <div className="text-ash-dim mono-tag uppercase text-[10px]">Spread Radius</div>
                  <div className="text-bone font-display font-semibold text-base">{selected.predictedSpreadRadiusM ? `${selected.predictedSpreadRadiusM}m` : '—'}</div>
                </div>
                <div>
                  <div className="text-ash-dim mono-tag uppercase text-[10px]">Reported</div>
                  <div className="text-bone font-display font-semibold text-base">{new Date(selected.reportedAt).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="mono-tag text-[10px] text-ash-dim pt-2 border-t border-line">
                {selected.latitude.toFixed(4)}N, {selected.longitude.toFixed(4)}E
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <LegendRow color="#ff3b30" label="Critical incident" />
              <LegendRow color="#e30613" label="High severity" />
              <LegendRow color="#cfccc4" label="Moderate severity" />
              <LegendRow color="#8b8b90" label="Low severity" />
              <div className="pt-2 border-t border-line space-y-2">
                <div className="flex items-center gap-2 text-ash text-xs">
                  <span className="inline-block w-3 h-px bg-bone" /><span className="inline-block w-px h-3 bg-bone -ml-1.5" />
                  Hospital / medical facility
                </div>
                <div className="flex items-center gap-2 text-ash text-xs">
                  <span className="inline-block w-2 h-2 bg-ash rotate-45" /> Resource unit position
                </div>
              </div>
              <p className="text-ash-dim text-xs pt-2 border-t border-line">Click any incident marker on the map to inspect agent-derived details.</p>
            </div>
          )}
        </Panel>
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
