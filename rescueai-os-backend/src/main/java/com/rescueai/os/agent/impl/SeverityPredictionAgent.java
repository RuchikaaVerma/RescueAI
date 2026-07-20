package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.enums.AgentName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Agent 3 — Severity & Spread Prediction.
 * MVP: LLM-reasoned estimate grounded in incident type + description.
 * Research extension point: replace/augment with an LSTM/GNN model called
 * from here, keeping the same Agent contract so the orchestrator is untouched.
 */
@Component
@RequiredArgsConstructor
public class SeverityPredictionAgent implements Agent {

    private final LlmClient llmClient;

    private static final String SYSTEM_PROMPT = """
            You are the Severity & Spread Prediction Agent. Given a disaster type and description,
            estimate how the situation will evolve over the next few hours.
            Respond with ONLY compact JSON:
            {
              "predictedSpreadRadiusMeters": number,
              "trend": one of ["ESCALATING","STABLE","DECLINING"],
              "estimatedTimeToEscalationMinutes": number or null,
              "reasoning": short one-sentence justification
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.SEVERITY_PREDICTION;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();
        String detection = context.read("detection");
        String userPrompt = "Incident description: " + context.getRawReportText()
                + "\nDetection agent output: " + detection;

        String output = llmClient.complete(SYSTEM_PROMPT, userPrompt);
        context.publish("severityPrediction", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.65) // predictive tasks are inherently less certain — logged honestly
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
