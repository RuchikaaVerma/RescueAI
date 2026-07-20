import { useState } from 'react';
import { Send, AlertTriangle, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Panel, StatCard } from '../components/Panel';
import AgentPipeline from '../components/AgentPipeline';
import TacticalMap from '../components/TacticalMap';
import { SeverityBadge, StatusPill } from '../components/Badges';
import { IncidentApi } from '../lib/api';
import { runPipelineDemo, makeIncident, DEMO_BOUNDS } from '../lib/mock';
import type { AgentName, AgentStepResult, IncidentResponse } from '../types';
import { AGENT_LABELS } from '../types';

export default function Dashboard() {
  const { mode, incidents, hospitals, resources, addIncident } = useData();
  const [rawText, setRawText] = useState('');
  const [running, setRunning] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [completed, setCompleted] = useState<Set<AgentName>>(new Set());
  const [steps, setSteps] = useState<AgentStepResult[]>([]);

  const critical = incidents.filter((i) => i.severityLevel === 'CRITICAL').length;
  const active = incidents.filter((i) => !['RESOLVED', 'CLOSED', 'REJECTED_DUPLICATE', 'REJECTED_FALSE'].includes(i.status)).length;
  const avgConfidence = incidents.length
    ? (incidents.reduce((s, i) => s + (i.verificationConfidence ?? 0), 0) / incidents.length * 100).toFixed(0)
    : '—';

  async function submitReport() {
    if (!rawText.trim() || running) return;
    setRunning(true);
    setCompleted(new Set());
    setSteps([]);

    const lat = DEMO_BOUNDS.minLat + Math.random() * (DEMO_BOUNDS.maxLat - DEMO_BOUNDS.minLat);
    const lng = DEMO_BOUNDS.minLng + Math.random() * (DEMO_BOUNDS.maxLng - DEMO_BOUNDS.minLng);

    if (mode === 'live') {
      try {
        const res = await IncidentApi.report({ rawText, latitude: lat, longitude: lng });
        addIncident(res.incident);
        for (const step of res.steps) {
          setActiveAgent(step.agentName as AgentName);
          await new Promise((r) => setTimeout(r, 220));
          setSteps((s) => [...s, step]);
          setCompleted((c) => new Set(c).add(step.agentName as AgentName));
        }
      } catch {
        // fall through to demo simulation
      }
    } else {
      const incident: IncidentResponse = makeIncident({ description: rawText.slice(0, 80), latitude: lat, longitude: lng, status: 'REPORTED' });
      addIncident(incident);
      for await (const step of runPipelineDemo(incident)) {
        setActiveAgent(step.agentName as AgentName);
        setSteps((s) => [...s, step]);
        setCompleted((c) => new Set(c).add(step.agentName as AgentName));
      }
    }

    setActiveAgent(null);
    setRunning(false);
    setRawText('');
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden hero-gradient scanlines"
        style={{ border: '1px solid var(--color-rose-border)' }}
      >
        {/* Decorative red accent blob */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-4 left-1/3 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(253,164,175,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 mono-tag text-[11px] uppercase tracking-[0.2em] mb-3 px-3 py-1.5 rounded-full"
              style={{
                color: 'var(--color-signal)',
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.15)',
              }}
            >
              <Zap size={10} />
              Disaster Intelligence · Coastal District
            </div>
            <h1
              className="font-display font-bold text-3xl md:text-[34px] leading-tight"
              style={{ color: 'var(--color-bone)' }}
            >
              Command Center
            </h1>
            <p className="text-sm mt-1.5 max-w-xl" style={{ color: 'var(--color-ash)' }}>
              Nine specialized agents, one orchestrated pipeline — report, verify, predict, allocate, and coordinate in a single pass.
            </p>
          </div>

          <div className="flex gap-8">
            <div className="text-center">
              <div
                className="font-display font-bold text-3xl text-glow-red"
                style={{ color: 'var(--color-signal)' }}
              >
                {active}
              </div>
              <div className="mono-tag text-[10px] uppercase mt-0.5" style={{ color: 'var(--color-ash)' }}>
                Active Incidents
              </div>
            </div>
            <div className="text-center">
              <div
                className="font-display font-bold text-3xl"
                style={{ color: 'var(--color-bone)' }}
              >
                {hospitals.length}
              </div>
              <div className="mono-tag text-[10px] uppercase mt-0.5" style={{ color: 'var(--color-ash)' }}>
                Hospitals Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Critical Incidents" value={critical} tone="critical" sub="require immediate response" />
        <StatCard label="Active Incidents" value={active} sub="across all tiers" />
        <StatCard label="Avg. Verification Confidence" value={`${avgConfidence}%`} sub="agent consensus score" />
        <StatCard label="Resources Deployed" value={resources.filter((r) => r.status === 'DISPATCHED' || r.status === 'ON_SITE').length} sub={`of ${resources.length} tracked types`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Report + Pipeline */}
        <div className="xl:col-span-2 space-y-6">
          <Panel eyebrow="Submit → Orchestrate" title="New Incident Report">
            <div className="flex gap-2">
              <input
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitReport()}
                placeholder="e.g. Water rising fast near Marina Rd, several homes flooded..."
                disabled={running}
                className="flex-1 input-light rounded-lg px-3.5 py-2.5 text-sm"
              />
              <button
                onClick={submitReport}
                disabled={running || !rawText.trim()}
                className="btn-primary shrink-0 flex items-center gap-2 font-display font-semibold px-4 py-2.5 rounded-lg text-sm"
              >
                <Send size={15} /> {running ? 'Processing…' : 'Report'}
              </button>
            </div>
            <div className="mt-6">
              <div
                className="mono-tag text-[10px] uppercase tracking-widest mb-3"
                style={{ color: 'var(--color-ash)' }}
              >
                Agent Orchestration DAG
              </div>
              <AgentPipeline activeAgent={activeAgent} completed={completed} />
              {steps.length > 0 && (
                <div className="mt-4 grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg px-3 py-2 text-xs animate-float-up"
                      style={{
                        background: '#fafafa',
                        border: '1px solid var(--color-line)',
                        animationDelay: `${idx * 30}ms`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-semibold" style={{ color: 'var(--color-bone)' }}>
                          {AGENT_LABELS[s.agentName] ?? s.agentName}
                        </span>
                        <span
                          className="mono-tag px-1.5 py-0.5 rounded text-[9px]"
                          style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)' }}
                        >
                          {s.latencyMs}ms
                        </span>
                      </div>
                      <div className="mono-tag truncate" style={{ color: 'var(--color-ash-dim)' }}>
                        {s.outputJson}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <Panel eyebrow="Situational Awareness" title="Live Map">
            <TacticalMap incidents={incidents} hospitals={hospitals} resources={resources} height={340} />
          </Panel>
        </div>

        {/* Feed */}
        <Panel eyebrow="Real-time" title="Incident Feed" className="flex flex-col" padded={false}>
          <div
            className="divide-y max-h-[820px] overflow-y-auto"
            style={{ borderColor: 'var(--color-line)' }}
          >
            {incidents.slice(0, 20).map((i, idx) => (
              <div
                key={i.id}
                className="px-5 py-3.5 row-hover animate-float-up"
                style={{ animationDelay: `${idx * 25}ms` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-display font-semibold text-sm flex items-center gap-1.5"
                    style={{ color: 'var(--color-bone)' }}
                  >
                    {i.severityLevel === 'CRITICAL' && (
                      <AlertTriangle size={13} style={{ color: 'var(--color-signal)' }} />
                    )}
                    {i.type?.replace(/_/g, ' ') ?? 'Unclassified'}
                  </span>
                  <SeverityBadge level={i.severityLevel} />
                </div>
                <div className="text-xs mb-1.5" style={{ color: 'var(--color-ash)' }}>
                  {i.description}
                </div>
                <div className="flex items-center justify-between">
                  <StatusPill status={i.status} />
                  <span className="mono-tag text-[10px]" style={{ color: 'var(--color-ash-dim)' }}>
                    {new Date(i.reportedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
