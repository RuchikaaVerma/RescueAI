package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.enums.AgentName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Agent 6 — Infrastructure.
 * Analyzes blocked roads/bridges/electricity/water status around the incident.
 * MVP reasons from report text; production wires this to live sensor/GIS feeds.
 */
@Component
@RequiredArgsConstructor
public class InfrastructureAgent implements Agent {

    private final LlmClient llmClient;

    private static final String SYSTEM_PROMPT = """
            You are the Infrastructure Agent. Analyze the incident for likely infrastructure impact.
            Respond with ONLY compact JSON:
            {
              "roadsLikelyBlocked": boolean,
              "bridgesAtRisk": boolean,
              "electricityImpact": one of ["NONE","PARTIAL","FULL_OUTAGE","UNKNOWN"],
              "waterSupplyImpact": one of ["NONE","PARTIAL","FULL_DISRUPTION","UNKNOWN"],
              "accessibilityNotes": short string for the Logistics Agent to consume,
              "reasoning": short justification
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.INFRASTRUCTURE;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();
        String output = llmClient.complete(SYSTEM_PROMPT, context.getRawReportText());
        context.publish("infrastructure", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.6)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
