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
      <div className="flex items-stretch gap-1.5 min-w-[820px] py-2">
        {LANES.map((lane, laneIdx) => (
          <div key={laneIdx} className="flex flex-col items-center justify-center gap-2 flex-1 relative">
            {laneIdx > 0 && (
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-px"
                style={{ background: 'var(--color-rose-border)' }}
              />
            )}
            {lane.map((agent) => {
              const isActive = activeAgent === agent;
              const isDone   = completed.has(agent);

              let containerStyle: React.CSSProperties = {};
              if (isActive) {
                containerStyle = {
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.04))',
                  border: '1.5px solid #dc2626',
                  boxShadow: '0 0 16px rgba(220,38,38,0.2), 0 2px 8px rgba(220,38,38,0.12)',
                  transform: 'scale(1.04)',
                };
              } else if (isDone) {
                containerStyle = {
                  background: '#fff1f2',
                  border: '1px solid var(--color-rose-border)',
                };
              } else {
                containerStyle = {
                  background: '#fafafa',
                  border: '1px solid var(--color-line)',
                  opacity: 0.65,
                };
              }

              return (
                <div
                  key={agent}
                  className="relative w-full rounded-lg px-3 py-2.5 text-center transition-all duration-300"
                  style={containerStyle}
                >
                  {isActive && (
                    <span className="absolute -top-1.5 -right-1.5">
                      <span className="pulse-dot" />
                    </span>
                  )}
                  {isDone && !isActive && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ background: '#16a34a', boxShadow: '0 0 6px rgba(22,163,74,0.4)' }}
                    >
                      ✓
                    </span>
                  )}
                  <div
                    className="mono-tag text-[9px] uppercase tracking-widest mb-0.5"
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
                  <div
                    className="font-display text-[13px] font-semibold leading-tight"
                    style={{
                      color: isActive || isDone
                        ? 'var(--color-bone)'
                        : 'var(--color-ash)',
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
