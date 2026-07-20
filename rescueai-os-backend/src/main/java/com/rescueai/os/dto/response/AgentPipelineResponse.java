package com.rescueai.os.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/** What the frontend's "AI Command Center" pipeline visualizer renders after an incident is processed. */
@Data @Builder
public class AgentPipelineResponse {
    private IncidentResponse incident;
    private List<AgentStepResult> steps;

    @Data @Builder
    public static class AgentStepResult {
        private String agentName;
        private String outputJson;
        private Double confidence;
        private Long latencyMs;
    }
}
