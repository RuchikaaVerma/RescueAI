package com.rescueai.os.agent.impl;

import com.rescueai.os.agent.Agent;
import com.rescueai.os.agent.AgentContext;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.ai.LlmClient;
import com.rescueai.os.domain.entity.Hospital;
import com.rescueai.os.domain.entity.Resource;
import com.rescueai.os.domain.enums.AgentName;
import com.rescueai.os.domain.enums.ResourceStatus;
import com.rescueai.os.repository.HospitalRepository;
import com.rescueai.os.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Agent 4 — Resource Planner.
 * Consumes real hospital-capacity and fleet-inventory data (not hallucinated),
 * and asks the LLM to reason over that grounded snapshot for a distribution plan.
 */
@Component
@RequiredArgsConstructor
public class ResourcePlannerAgent implements Agent {

    private final LlmClient llmClient;
    private final HospitalRepository hospitalRepository;
    private final ResourceRepository resourceRepository;

    private static final String SYSTEM_PROMPT = """
            You are the Resource Planner Agent. You are given real, current hospital capacity data
            and available fleet resources for this tenant, plus the incident severity context.
            Propose a concrete allocation plan. Respond with ONLY compact JSON:
            {
              "hospitalAllocations": [ { "hospitalName": string, "assignedPatients": integer } ],
              "resourceGaps": [ { "resourceType": string, "additionalUnitsNeeded": integer } ],
              "reasoning": short justification grounded in the numbers given
            }
            """;

    @Override
    public AgentName name() {
        return AgentName.RESOURCE_PLANNER;
    }

    @Override
    public AgentResult execute(AgentContext context) {
        long start = System.currentTimeMillis();
        var tenantId = context.getIncident().getTenant().getId();

        List<Hospital> hospitals = hospitalRepository.findByTenantId(tenantId);
        List<Resource> available = resourceRepository.findByTenantIdAndStatus(tenantId, ResourceStatus.AVAILABLE);

        String hospitalSummary = hospitals.stream()
                .map(h -> "%s: capacity=%d currentLoad=%d availableBeds=%d bloodUnits=%d".formatted(
                        h.getName(), h.getTotalCapacity(), h.getCurrentLoad(), h.availableBeds(), h.getBloodBankUnitsAvailable()))
                .collect(Collectors.joining("\n"));

        String resourceSummary = available.stream()
                .map(r -> "%s x%d (%s)".formatted(r.getType(), r.getQuantity(), r.getIdentifier()))
                .collect(Collectors.joining("\n"));

        String userPrompt = """
                Incident severity context: %s

                HOSPITALS:
                %s

                AVAILABLE RESOURCES:
                %s
                """.formatted(
                (String) context.read("severityPrediction"),
                hospitalSummary.isBlank() ? "(none registered)" : hospitalSummary,
                resourceSummary.isBlank() ? "(none available)" : resourceSummary);

        String output = llmClient.complete(SYSTEM_PROMPT, userPrompt);
        context.publish("resourcePlan", output);

        return AgentResult.builder()
                .agentName(name())
                .outputJson(output)
                .confidence(0.7)
                .latencyMs(System.currentTimeMillis() - start)
                .build();
    }
}
