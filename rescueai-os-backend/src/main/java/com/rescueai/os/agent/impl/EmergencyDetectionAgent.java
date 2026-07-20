package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.enums.AgentName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Agent 1 — Emergency Detection.
 * Input : raw citizen/sensor report text.
 * Output: disaster type + severity score (1-10) + priority tier, as JSON.
 */
@Component
@RequiredArgsConstructor
public class EmergencyDetectionAgent implements Agent {

    private final LlmClient llmClient;

    private static final String SYSTEM_PROMPT = """
            You are the Emergency Detection Agent inside a disaster-response AI operating system.
            Classify the incoming report and respond with ONLY a compact JSON object, no prose, no markdown fences:
            {
              "incidentType": one of ["EARTHQUAKE","FLOOD","FIRE","BUILDING_COLLAPSE","CYCLONE",
                                       "INDUSTRIAL_HAZARD","MEDICAL_EMERGENCY","ROAD_ACCIDENT","OTHER"],
              "severityScore": integer 1-10,
              "priority": one of ["LOW","MODERATE","HIGH","CRITICAL"],
              "reasoning": short one-sentence justification
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.EMERGENCY_DETECTION;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();
        String output = llmClient.complete(SYSTEM_PROMPT, context.getRawReportText());
        context.publish("detection", output);
        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.8)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
