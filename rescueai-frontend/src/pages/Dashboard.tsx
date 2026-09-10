import { useRef, useState } from 'react';
import { Send, AlertTriangle, Zap, Activity, Image, X, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Panel, StatCard } from '../components/Panel';
import AgentPipeline from '../components/AgentPipeline';
import TacticalMap from '../components/TacticalMap';
import { SeverityBadge, StatusPill } from '../components/Badges';
import { IncidentApi } from '../lib/api';
import { runPipelineDemo, makeIncident, DEMO_BOUNDS, simulateAgentOutput } from '../lib/mock';
import { analyzeIncidentWithGemini, geminiToAgentSteps, isGeminiEnabled } from '../lib/gemini';
import { AGENT_PIPELINE_ORDER } from '../types';
import type { AgentName, AgentStepResult, IncidentResponse } from '../types';
import { AGENT_LABELS } from '../types';

export default function Dashboard() {
  const { mode, incidents, hospitals, resources, addIncident } = useData();
  const [rawText, setRawText] = useState('');
  const [running, setRunning] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [completed, setCompleted] = useState<Set<AgentName>>(new Set());
  const [steps, setSteps] = useState<AgentStepResult[]>([]);
  const [aiPowered, setAiPowered] = useState(false);
  const [mediaFile, setMediaFile] = useState<{ name: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const critical = incidents.filter((i) => i.severityLevel === 'CRITICAL').length;
  const active = incidents.filter(
    (i) => !['RESOLVED', 'CLOSED', 'REJECTED_DUPLICATE', 'REJECTED_FALSE'].includes(i.status),
  ).length;
  const avgConfidence = incidents.length
    ? (
        (incidents.reduce((s, i) => s + (i.verificationConfidence ?? 0), 0) / incidents.length) *
        100
      ).toFixed(0)
    : '—';

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaFile({ name: file.name, preview: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  async function submitReport() {
    if (!rawText.trim() || running) return;
    setRunning(true);
    setCompleted(new Set());
    setSteps([]);
    setAiPowered(false);

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
        setRunning(false);
        setRawText('');
        setMediaFile(null);
        return;
      } catch {
        // Fall through to demo/AI simulation
      }
    }

    // Try Gemini AI first
    if (isGeminiEnabled) {
      try {
        const analysis = await analyzeIncidentWithGemini(rawText, lat, lng);
        if (analysis) {
          setAiPowered(true);
          const aiSteps = geminiToAgentSteps(analysis);

          const incident: IncidentResponse = makeIncident({
            description: rawText.slice(0, 80),
            latitude: lat,
            longitude: lng,
            type: analysis.incidentType as IncidentResponse['type'],
            severityLevel: analysis.severityLevel,
            severityScore: analysis.severityScore,
            predictedSpreadRadiusM: analysis.spreadRadiusM,
            verificationConfidence: analysis.confidence,
            status: 'REPORTED',
          });
          addIncident(incident);

          for (const agentName of AGENT_PIPELINE_ORDER) {
            setActiveAgent(agentName);
            await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
            const step: AgentStepResult = {
              agentName,
              outputJson: aiSteps[agentName] ?? simulateAgentOutput(agentName, incident),
              confidence: analysis.confidence,
              latencyMs: Math.floor(120 + Math.random() * 350),
            };
            setSteps((s) => [...s, step]);
            setCompleted((c) => new Set(c).add(agentName));
          }
          setActiveAgent(null);
          setRunning(false);
          setRawText('');
          setMediaFile(null);
          return;
        }
      } catch {
        // Fall through to mock simulation
      }
    }

    // Mock simulation fallback
    const incident: IncidentResponse = makeIncident({
      description: rawText.slice(0, 80),
      latitude: lat,
      longitude: lng,
      status: 'REPORTED',
    });
    addIncident(incident);
    for await (const step of runPipelineDemo(incident)) {
      setActiveAgent(step.agentName as AgentName);
      setSteps((s) => [...s, step]);
      setCompleted((c) => new Set(c).add(step.agentName as AgentName));
    }

    setActiveAgent(null);
    setRunning(false);
    setRawText('');
    setMediaFile(null);
  }

  return (
    <div className="p-6 space-y-6">

      {/* ══════════ HERO BANNER ══════════ */}
      <div className="hero-gradient rounded-3xl p-7 relative overflow-hidden scanlines">
        {/* Decorative blobs */}
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.14) 0%, transparent 70%)',
            filter: 'blur(32px)',
            animation: 'orb-drift 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-8 left-1/4 w-44 h-44 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(253,164,175,0.18) 0%, transparent 70%)',
            filter: 'blur(28px)',
            animation: 'orb-drift 18s ease-in-out infinite reverse',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          {/* Left: title */}
          <div>
            <div
              className="inline-flex items-center gap-2 mono-tag text-[11px] uppercase tracking-[0.2em] mb-3 px-3 py-1.5 rounded-full chip-red"
            >
              <Zap size={10} />
              Disaster Intelligence · Coastal District
            </div>

            <h1
              className="font-display font-bold text-4xl md:text-[38px] leading-tight mb-2"
              style={{ color: 'var(--color-bone)' }}
            >
              Command{' '}
              <span className="text-shimmer-red">Center</span>
            </h1>

            <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'var(--color-ash)' }}>
              Nine specialized agents, one orchestrated pipeline — report, verify, predict, allocate,
              and coordinate in a single pass.
              {isGeminiEnabled && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] mono-tag font-semibold" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Sparkles size={9} /> Gemini AI Active
                </span>
              )}
            </p>
          </div>

          {/* Right: quick stats */}
          <div className="flex gap-8 shrink-0">
            <div className="text-center">
              <div
                className="font-display font-bold text-4xl text-glow-red"
                style={{ color: 'var(--color-signal)' }}
              >
                {active}
              </div>
              <div className="mono-tag text-[10px] uppercase mt-1 tracking-widest" style={{ color: 'var(--color-ash)' }}>
                Active Incidents
              </div>
            </div>
            <div
              className="w-px self-stretch"
              style={{ background: 'rgba(220,38,38,0.15)' }}
            />
            <div className="text-center">
              <div
                className="font-display font-bold text-4xl"
                style={{ color: 'var(--color-bone)' }}
              >
                {hospitals.length}
              </div>
              <div className="mono-tag text-[10px] uppercase mt-1 tracking-widest" style={{ color: 'var(--color-ash)' }}>
                Hospitals Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ STAT CARDS ══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Critical Incidents"           value={critical}          tone="critical" sub="require immediate response" />
        <StatCard label="Active Incidents"             value={active}            sub="across all tiers" />
        <StatCard label="Avg. Verification Confidence" value={`${avgConfidence}%`} sub="agent consensus score" />
        <StatCard
          label="Resources Deployed"
          value={resources.filter((r) => r.status === 'DISPATCHED' || r.status === 'ON_SITE').length}
          sub={`of ${resources.length} tracked types`}
        />
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Report + Pipeline + Map ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Report panel */}
          <Panel eyebrow="Submit → Orchestrate" title="New Incident Report">
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <input
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitReport()}
                  placeholder="e.g. Water rising fast near Marina Rd, several homes flooded…"
                  disabled={running}
                  className="flex-1 input-light rounded-xl px-4 py-3 text-sm"
                />
                <button
                  onClick={submitReport}
                  disabled={running || !rawText.trim()}
                  className="btn-primary shrink-0 flex items-center gap-2 font-display font-semibold px-5 py-3 rounded-xl text-sm"
                >
                  <Send size={14} />
                  {running ? 'Processing…' : 'Report'}
                </button>
              </div>

              {/* Media upload row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={running}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs mono-tag transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(220,38,38,0.05)',
                    border: '1px solid rgba(220,38,38,0.15)',
                    color: 'var(--color-ash)',
                  }}
                >
                  <Image size={12} style={{ color: 'var(--color-signal)' }} />
                  {mediaFile ? 'Change Photo' : 'Attach Photo / Video'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {mediaFile && (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {mediaFile.preview.startsWith('data:image') && (
                      <img src={mediaFile.preview} alt="preview" className="w-8 h-8 rounded-lg object-cover border border-line" />
                    )}
                    <span className="text-xs truncate" style={{ color: 'var(--color-ash)' }}>{mediaFile.name}</span>
                    <button
                      onClick={() => { setMediaFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                      style={{ color: 'var(--color-ash-dim)' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div
                className="mono-tag text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ color: 'var(--color-ash)' }}
              >
                <Activity size={11} style={{ color: 'var(--color-signal)' }} />
                Agent Orchestration DAG
                {aiPowered && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <Sparkles size={8} /> AI-powered
                  </span>
                )}
              </div>
              <AgentPipeline activeAgent={activeAgent} completed={completed} />

              {steps.length > 0 && (
                <div className="mt-4 grid sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl px-3.5 py-2.5 text-xs animate-float-up"
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(220,38,38,0.10)',
                        backdropFilter: 'blur(8px)',
                        animationDelay: `${idx * 35}ms`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-display font-semibold text-[13px]"
                          style={{ color: 'var(--color-bone)' }}
                        >
                          {AGENT_LABELS[s.agentName] ?? s.agentName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(() => { try { return (JSON.parse(s.outputJson) as Record<string, boolean>).aiPowered; } catch { return false; } })() && (
                            <Sparkles size={9} style={{ color: '#7c3aed' }} />
                          )}
                          <span
                            className="mono-tag px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
                            style={{
                              color: 'var(--color-signal)',
                              background: 'rgba(220,38,38,0.08)',
                              border: '1px solid rgba(220,38,38,0.15)',
                            }}
                          >
                            {s.latencyMs}ms
                          </span>
                        </div>
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

          {/* Map panel */}
          <Panel eyebrow="Situational Awareness" title="Live Map">
            <TacticalMap incidents={incidents} hospitals={hospitals} resources={resources} height={340} />
          </Panel>
        </div>

        {/* ── Incident feed ── */}
        <Panel eyebrow="Real-time" title="Incident Feed" className="flex flex-col" padded={false}>
          <div className="divide-y max-h-[820px] overflow-y-auto divide-red">
            {incidents.slice(0, 20).map((i, idx) => (
              <div
                key={i.id}
                className="px-5 py-4 row-hover animate-float-up relative overflow-hidden"
                style={{ animationDelay: `${idx * 28}ms` }}
              >
                {/* Left red accent bar on critical */}
                {i.severityLevel === 'CRITICAL' && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                    style={{ background: 'var(--color-signal)', boxShadow: '0 0 8px rgba(220,38,38,0.4)' }}
                  />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-display font-semibold text-sm flex items-center gap-1.5"
                    style={{ color: 'var(--color-bone)' }}
                  >
                    {i.severityLevel === 'CRITICAL' && (
                      <AlertTriangle
                        size={13}
                        style={{
                          color: 'var(--color-signal)',
                          filter: 'drop-shadow(0 0 4px rgba(220,38,38,0.4))',
                        }}
                      />
                    )}
                    {i.type?.replace(/_/g, ' ') ?? 'Unclassified'}
                  </span>
                  <SeverityBadge level={i.severityLevel} />
                </div>

                <div className="text-xs mb-1.5 leading-relaxed" style={{ color: 'var(--color-ash)' }}>
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
