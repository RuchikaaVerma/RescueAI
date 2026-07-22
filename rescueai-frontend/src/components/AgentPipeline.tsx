import { AGENT_PIPELINE_ORDER, AGENT_LABELS, type AgentName } from '../types';

const LANES: AgentName[][] = [
  ['EMERGENCY_DETECTION'],
  ['VERIFICATION'],
  ['SEVERITY_PREDICTION', 'INFRASTRUCTURE'],
  ['RESOURCE_PLANNER'],
  ['MEDICAL', 'LOGISTICS'],
  ['COMMUNICATION'],
  ['OUTCOME_LEARNING'],
];

export default function AgentPipeline({
  activeAgent, completed,
}: { activeAgent: AgentName | null; completed: Set<AgentName> }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-stretch gap-2 min-w-[820px] py-3">
        {LANES.map((lane, laneIdx) => (
          <div key={laneIdx} className="flex flex-col items-center justify-center gap-2 flex-1 relative">

            {/* Connector line */}
            {laneIdx > 0 && (
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-px pipeline-connector"
              />
            )}

            {lane.map((agent) => {
              const isActive = activeAgent === agent;
              const isDone   = completed.has(agent);

              let containerStyle: React.CSSProperties = {};
              if (isActive) {
                containerStyle = {
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.10), rgba(220,38,38,0.04))',
                  border: '1.5px solid rgba(220,38,38,0.7)',
                  boxShadow: '0 0 20px rgba(220,38,38,0.25), 0 4px 12px rgba(220,38,38,0.12)',
                  transform: 'scale(1.05)',
                  backdropFilter: 'blur(8px)',
                };
              } else if (isDone) {
                containerStyle = {
                  background: 'rgba(255,241,242,0.8)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  backdropFilter: 'blur(8px)',
                };
              } else {
                containerStyle = {
                  background: 'rgba(250,250,250,0.7)',
                  border: '1px solid rgba(220,38,38,0.08)',
                  opacity: 0.6,
                  backdropFilter: 'blur(8px)',
                };
              }

              return (
                <div
                  key={agent}
                  className={`relative w-full rounded-xl px-3 py-2.5 text-center transition-all duration-300 ${
                    isActive ? 'agent-node-active' : ''
                  }`}
                  style={containerStyle}
                >
                  {/* Active pulse dot */}
                  {isActive && (
                    <span className="absolute -top-1.5 -right-1.5">
                      <span className="pulse-dot" />
                    </span>
                  )}

                  {/* Done check */}
                  {isDone && !isActive && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        boxShadow: '0 0 8px rgba(22,163,74,0.5)',
                      }}
                    >
                      ✓
                    </span>
                  )}

                  {/* Step number */}
                  <div
                    className="mono-tag text-[9px] uppercase tracking-widest mb-0.5 font-semibold"
                    style={{
                      color: isActive
                        ? 'var(--color-signal)'
                        : isDone
                        ? '#16a34a'
                        : 'var(--color-ash-dim)',
                    }}
                  >
                    {String(AGENT_PIPELINE_ORDER.indexOf(agent) + 1).padStart(2, '0')}
                  </div>

                  {/* Agent label */}
                  <div
                    className="font-display text-[12px] font-semibold leading-tight"
                    style={{
                      color: isActive
                        ? 'var(--color-signal)'
                        : isDone
                        ? 'var(--color-bone)'
                        : 'var(--color-ash)',
                      textShadow: isActive ? '0 0 12px rgba(220,38,38,0.3)' : 'none',
                    }}
                  >
                    {AGENT_LABELS[agent]}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
