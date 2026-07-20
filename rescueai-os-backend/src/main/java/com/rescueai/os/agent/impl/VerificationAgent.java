package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.entity.Incident;
import com.rescueai.os.domain.enums.AgentName;
import com.rescueai.os.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Agent 2 — Verification.
 * Cross-checks the new report against other recent nearby incidents to catch
 * duplicates and reduce misinformation/panic-driven false positives.
 */
@Component
@RequiredArgsConstructor
public class VerificationAgent implements Agent {

    private final LlmClient llmClient;
    private final IncidentRepository incidentRepository;

    private static final double NEARBY_DEGREES = 0.02; // ~roughly 2km at equator, MVP approximation

    private static final String SYSTEM_PROMPT = """
            You are the Verification Agent. You receive a new incident report and a list of
            recent nearby incidents already on record. Decide if this is a NEW distinct event,
            a DUPLICATE of an existing one, or likely FALSE/unreliable.
            Respond with ONLY compact JSON:
            {
              "verdict": one of ["NEW","DUPLICATE","FALSE"],
              "confidence": number 0.0-1.0,
              "matchedIncidentId": string or null,
              "reasoning": short one-sentence justification
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.VERIFICATION;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();
        Incident incident = context.getIncident();

        List<Incident> nearby = incidentRepository.findNearbyActive(
                incident.getTenant().getId(), incident.getLatitude(), incident.getLongitude(), NEARBY_DEGREES);

        String nearbySummary = nearby.stream()
                .filter(i -> !i.getId().equals(incident.getId()))
                .map(i -> "id=%s type=%s status=%s reportedAt=%s".formatted(
                        i.getId(), i.getType(), i.getStatus(), i.getReportedAt()))
                .collect(Collectors.joining("\n"));

        String userPrompt = """
                NEW REPORT:
                %s

                NEARBY RECENT INCIDENTS:
                %s
                """.formatted(context.getRawReportText(),
                nearbySummary.isBlank() ? "(none)" : nearbySummary);

        String output = llmClient.complete(SYSTEM_PROMPT, userPrompt);
        context.publish("verification", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.75)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
