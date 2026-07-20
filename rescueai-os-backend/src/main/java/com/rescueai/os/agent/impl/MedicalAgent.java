package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.enums.AgentName;
import com.rescueai.os.repository.SopDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Agent 5 — Medical.
 * Grounded in the SOP corpus (RAG) so recommendations trace back to real
 * protocols rather than free-floating LLM medical guesses.
 */
@Component
@RequiredArgsConstructor
public class MedicalAgent implements Agent {

    private final LlmClient llmClient;
    private final SopDocumentRepository sopDocumentRepository;

    private static final String SYSTEM_PROMPT = """
            You are the Medical Agent. Using the incident context and the provided medical SOP
            excerpts as your grounding, suggest trauma care priorities, emergency medicine needs,
            and blood requirements. Respond with ONLY compact JSON:
            {
              "traumaCarePriorities": [string],
              "emergencyMedicineNeeded": [string],
              "estimatedBloodUnitsNeeded": integer,
              "reasoning": short justification citing which SOP guidance was used
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.MEDICAL;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();

        String sopExcerpts = sopDocumentRepository.findByCategory("MEDICAL").stream()
                .limit(5)
                .map(s -> "[" + s.getTitle() + "] " + s.getContent())
                .collect(Collectors.joining("\n---\n"));

        String userPrompt = """
                Incident: %s
                Detection output: %s

                RELEVANT MEDICAL SOPs:
                %s
                """.formatted(
                context.getRawReportText(),
                (String) context.read("detection"),
                sopExcerpts.isBlank() ? "(no SOP corpus loaded for this tenant yet)" : sopExcerpts);

        String output = llmClient.complete(SYSTEM_PROMPT, userPrompt);
        context.publish("medical", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.72)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
