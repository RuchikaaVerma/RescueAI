package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.enums.AgentName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Agent 8 — Communication. Runs last, synthesizing every other agent's output
 * into audience-appropriate messages: citizen alerts, government reports, and
 * multilingual public announcements.
 */
@Component
@RequiredArgsConstructor
public class CommunicationAgent implements Agent {

    private final LlmClient llmClient;

    private static final String SYSTEM_PROMPT = """
            You are the Communication Agent, the final step in a disaster-response pipeline.
            Given the full pipeline output, draft audience-specific messages.
            Respond with ONLY compact JSON:
            {
              "citizenAlert": string (short, calm, actionable),
              "governmentReport": string (formal, factual, includes key numbers),
              "multilingualAnnouncement": { "en": string, "hi": string },
              "reasoning": short justification
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.COMMUNICATION;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();

        String userPrompt = """
                Detection: %s
                Severity/Spread: %s
                Resource plan: %s
                Medical: %s
                Infrastructure: %s
                Logistics: %s
                """.formatted(
                (String) context.read("detection"),
                (String) context.read("severityPrediction"),
                (String) context.read("resourcePlan"),
                (String) context.read("medical"),
                (String) context.read("infrastructure"),
                (String) context.read("logistics"));

        String output = llmClient.complete(SYSTEM_PROMPT, userPrompt);
        context.publish("communication", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.78)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
