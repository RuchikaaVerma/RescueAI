package com.rescueai.os.agent;

import com.rescueai.os.agent.impl.*;
import com.rescueai.os.domain.entity.AgentAction;
import com.rescueai.os.domain.entity.Incident;
import com.rescueai.os.repository.AgentActionRepository;
import com.rescueai.os.websocket.AlertBroadcaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * The heart of the platform: routes an Incident through the specialized-agent
 * DAG described in the project overview —
 *
 *   Detection -> Verification -> [Severity/Spread || Infrastructure]
 *             -> Resource Planner -> [Medical || Logistics] -> Communication
 *
 * Every agent's output is persisted as an AgentAction (audit trail for Phase 2
 * research + Phase 3 compliance) and pushed live to the frontend over WebSocket.
 *
 * NOTE: agents currently run sequentially for readability/determinism in the MVP.
 * Severity/Infrastructure and Medical/Logistics are independent of each other and
 * are natural candidates to submit to the `agentTaskExecutor` pool in parallel —
 * left sequential here so the audit trail order is trivial to reason about; switch
 * to CompletableFuture.supplyAsync(..., agentTaskExecutor) once the pipeline is stable.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AgentOrchestrator {

    private final EmergencyDetectionAgent detectionAgent;
    private final VerificationAgent verificationAgent;
    private final SeverityPredictionAgent severityPredictionAgent;
    private final InfrastructureAgent infrastructureAgent;
    private final ResourcePlannerAgent resourcePlannerAgent;
    private final MedicalAgent medicalAgent;
    private final LogisticsAgent logisticsAgent;
    private final CommunicationAgent communicationAgent;

    private final AgentActionRepository agentActionRepository;
    private final AlertBroadcaster alertBroadcaster;

    public List<AgentResult> runFullPipeline(Incident incident, String rawReportText) {
        AgentContext context = AgentContext.builder()
                .incident(incident)
                .rawReportText(rawReportText)
                .build();

        List<Agent> pipeline = List.of(
                detectionAgent,
                verificationAgent,
                severityPredictionAgent,
                infrastructureAgent,
                resourcePlannerAgent,
                medicalAgent,
                logisticsAgent,
                communicationAgent
        );

        List<AgentResult> results = new ArrayList<>();

        for (Agent agent : pipeline) {
            try {
                AgentResult result = agent.execute(context);
                results.add(result);
                persist(incident, result, rawReportText);
                alertBroadcaster.broadcastAgentStep(
                        incident.getId().toString(), result.getAgentName().name(), result.getOutputJson());
                log.info("Agent {} completed for incident {} in {}ms",
                        result.getAgentName(), incident.getId(), result.getLatencyMs());
            } catch (Exception ex) {
                log.error("Agent {} failed for incident {}: {}", agent.name(), incident.getId(), ex.getMessage(), ex);
                // Fail soft: one agent failing should not collapse the whole pipeline.
                // Downstream agents will simply see a null value on the blackboard for this step.
            }
        }

        return results;
    }

    private void persist(Incident incident, AgentResult result, String inputSummary) {
        AgentAction action = AgentAction.builder()
                .incident(incident)
                .agentName(result.getAgentName())
                .inputSummary(inputSummary.length() > 500 ? inputSummary.substring(0, 500) : inputSummary)
                .outputJson(result.getOutputJson())
                .confidence(result.getConfidence())
                .latencyMs(result.getLatencyMs())
                .build();
        agentActionRepository.save(action);
    }
}
