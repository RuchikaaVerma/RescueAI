package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.enums.AgentName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Agent 7 — Logistics.
 * Deliberately depends on the Infrastructure Agent's output (reads it off the
 * blackboard) — this cross-agent dependency is the core "coordination" claim
 * for the research paper, not just parallel independent LLM calls.
 */
@Component
@RequiredArgsConstructor
public class LogisticsAgent implements Agent {

    private final LlmClient llmClient;

    private static final String SYSTEM_PROMPT = """
            You are the Logistics Agent. Using the resource plan and the Infrastructure Agent's
            accessibility assessment, decide the best transport mix and routing approach.
            Respond with ONLY compact JSON:
            {
              "transportPlan": [ { "assetType": one of ["HELICOPTER","TRUCK","RESCUE_BOAT","AMBULANCE","DRONE"],
                                    "count": integer, "justification": string } ],
              "routingNotes": string,
              "reasoning": short justification
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.LOGISTICS;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();

        String userPrompt = """
                Resource plan: %s
                Infrastructure assessment: %s
                """.formatted(
                (String) context.read("resourcePlan"),
                (String) context.read("infrastructure"));

        String output = llmClient.complete(SYSTEM_PROMPT, userPrompt);
        context.publish("logistics", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.68)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
