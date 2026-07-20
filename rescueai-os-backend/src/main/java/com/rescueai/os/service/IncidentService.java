package com.rescueai.os.service;

import com.rescueai.os.agent.AgentOrchestrator;
import com.rescueai.os.agent.AgentResult;
import com.rescueai.os.domain.entity.Incident;
import com.rescueai.os.domain.entity.IncidentReport;
import com.rescueai.os.domain.entity.Tenant;
import com.rescueai.os.domain.entity.User;
import com.rescueai.os.domain.enums.IncidentStatus;
import com.rescueai.os.dto.request.IncidentReportRequest;
import com.rescueai.os.dto.response.AgentPipelineResponse;
import com.rescueai.os.dto.response.IncidentResponse;
import com.rescueai.os.repository.IncidentReportRepository;
import com.rescueai.os.repository.IncidentRepository;
import com.rescueai.os.websocket.AlertBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final AgentOrchestrator agentOrchestrator;
    private final AlertBroadcaster alertBroadcaster;

    /**
     * Entry point matching the vision doc's flow:
     *   Citizen reports -> Incident record created -> full agent pipeline runs
     *   -> AI verifies -> estimates severity -> predicts spread -> allocates
     *   resources -> coordinates hospitals -> drafts communications.
     */
    @Transactional
    public AgentPipelineResponse submitReportAndRunPipeline(IncidentReportRequest request, Tenant tenant, User reporter) {

        Incident incident = Incident.builder()
                .tenant(tenant)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getRawText())
                .status(IncidentStatus.VERIFYING)
                .build();
        incident = incidentRepository.save(incident);

        IncidentReport report = IncidentReport.builder()
                .incident(incident)
                .reportedBy(reporter)
                .rawText(request.getRawText())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .mediaUrls(request.getMediaUrls())
                .build();
        incidentReportRepository.save(report);

        alertBroadcaster.broadcastIncidentUpdate(IncidentResponse.from(incident));

        List<AgentResult> results = agentOrchestrator.runFullPipeline(incident, request.getRawText());

        // Mark as having gone through the pipeline; a human command-center operator
        // reviews AgentAction records and moves status forward (RESOURCES_ALLOCATED, etc.)
        incident.setStatus(IncidentStatus.VERIFIED);
        incident = incidentRepository.save(incident);
        alertBroadcaster.broadcastIncidentUpdate(IncidentResponse.from(incident));

        List<AgentPipelineResponse.AgentStepResult> steps = results.stream()
                .map(r -> AgentPipelineResponse.AgentStepResult.builder()
                        .agentName(r.getAgentName().name())
                        .outputJson(r.getOutputJson())
                        .confidence(r.getConfidence())
                        .latencyMs(r.getLatencyMs())
                        .build())
                .collect(Collectors.toList());

        return AgentPipelineResponse.builder()
                .incident(IncidentResponse.from(incident))
                .steps(steps)
                .build();
    }

    public List<IncidentResponse> listForTenant(UUID tenantId) {
        return incidentRepository.findByTenantIdOrderByReportedAtDesc(tenantId).stream()
                .map(IncidentResponse::from)
                .collect(Collectors.toList());
    }

    public IncidentResponse getOne(UUID id) {
        return incidentRepository.findById(id)
                .map(IncidentResponse::from)
                .orElseThrow(() -> new com.rescueai.os.exception.ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Incident not found: " + id));
    }
}
