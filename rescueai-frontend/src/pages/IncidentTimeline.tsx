import { useMemo, useState } from 'react';
import { Panel } from '../components/Panel';
import { SeverityBadge, StatusPill } from '../components/Badges';
import { useData } from '../context/DataContext';
import { AGENT_PIPELINE_ORDER, AGENT_LABELS } from '../types';
import { simulateAgentOutput } from '../lib/mock';
import type { IncidentResponse, IncidentType, SeverityLevel } from '../types';

const TYPE_FILTERS: (IncidentType | 'ALL')[] = ['ALL', 'FLOOD', 'FIRE', 'BUILDING_COLLAPSE', 'CYCLONE', 'ROAD_ACCIDENT', 'MEDICAL_EMERGENCY'];
const SEV_FILTERS:  (SeverityLevel | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

export default function IncidentTimeline() {
  const { incidents } = useData();
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'ALL'>('ALL');
  const [sevFilter,  setSevFilter]  = useState<SeverityLevel | 'ALL'>('ALL');
  const [selected,   setSelected]   = useState<IncidentResponse | null>(null);

  const filtered = useMemo(() => {
    return incidents
      .filter((i) => typeFilter === 'ALL' || i.type === typeFilter)
      .filter((i) => sevFilter  === 'ALL' || i.severityLevel === sevFilter)
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }, [incidents, typeFilter, sevFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div
            className="inline-flex items-center mono-tag text-[11px] uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full"
            style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            Chronological · Agent-Annotated
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
            Incident Timeline
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterGroup value={typeFilter} options={TYPE_FILTERS} onChange={setTypeFilter} />
          <FilterGroup value={sevFilter}  options={SEV_FILTERS}  onChange={setSevFilter}  />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {filtered.map((i, idx) => (
            <button
              key={i.id}
              onClick={() => setSelected(i)}
              className="hud-panel w-full text-left rounded-xl px-5 py-4 transition-all animate-float-up"
              style={{
                animationDelay: `${idx * 25}ms`,
                ...(selected?.id === i.id
                  ? { borderColor: '#dc2626', background: '#fff1f2', boxShadow: '0 0 0 2px rgba(220,38,38,0.15)' }
                  : {}),
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-semibold text-base" style={{ color: 'var(--color-bone)' }}>
                  {i.type?.replace(/_/g, ' ') ?? 'Unclassified'}
                </span>
                <SeverityBadge level={i.severityLevel} />
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--color-ash)' }}>{i.description}</p>
              <div className="flex items-center justify-between">
                <StatusPill status={i.status} />
                <span className="mono-tag text-[10px]" style={{ color: 'var(--color-ash-dim)' }}>
                  {new Date(i.reportedAt).toLocaleString()}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div
              className="text-center text-sm py-16 rounded-xl"
              style={{ color: 'var(--color-ash)', border: '2px dashed var(--color-rose-border)' }}
            >
              No incidents match this filter.
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Panel eyebrow="Audit Trail" title={selected ? 'Agent Decision Chain' : 'Select an Incident'} className="sticky top-6">
            {selected ? (
              <div className="space-y-3">
                {AGENT_PIPELINE_ORDER.map((agent, idx) => (
                  <div
                    key={agent}
                    className="relative pl-6 pb-3 last:pb-0"
                    style={{ borderLeft: '2px solid var(--color-rose-border)' }}
                  >
                    <span
                      className="absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full"
                      style={{ background: 'var(--color-signal)', border: '2px solid #ffffff', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' }}
                    />
                    <div className="mono-tag text-[10px] uppercase mb-0.5" style={{ color: 'var(--color-ash-dim)' }}>
                      Step {idx + 1}
                    </div>
                    <div className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--color-bone)' }}>
                      {AGENT_LABELS[agent]}
                    </div>
                    <div
                      className="mono-tag text-[11px] rounded-lg px-2.5 py-1.5"
                      style={{ color: 'var(--color-ash)', background: '#fafafa', border: '1px solid var(--color-line)' }}
                    >
                      {simulateAgentOutput(agent, selected)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-ash)' }}>
                Choose an incident from the list to view the full nine-agent decision chain that produced its current status — the audit trail behind every automated action.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1"
      style={{ background: 'var(--color-steel)', border: '1px solid var(--color-line)' }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="mono-tag text-[10px] uppercase px-2.5 py-1.5 rounded-lg transition-all duration-200"
          style={
            value === opt
              ? { background: 'var(--color-signal)', color: '#ffffff', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }
              : { color: 'var(--color-ash)' }
          }
        >
          {opt.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}
