package com.rescueai.os.controller;

import com.rescueai.os.domain.entity.User;
import com.rescueai.os.dto.request.IncidentReportRequest;
import com.rescueai.os.dto.response.AgentPipelineResponse;
import com.rescueai.os.dto.response.IncidentResponse;
import com.rescueai.os.security.SecurityUser;
import com.rescueai.os.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    /**
     * The core "one call does it all" endpoint: a citizen (or sensor integration)
     * submits a raw report; the full agent pipeline (detect -> verify -> predict
     * -> allocate -> coordinate -> communicate) runs synchronously and the
     * aggregated result is returned, while WebSocket subscribers get live updates
     * for every step as it completes.
     */
    @PostMapping("/report")
    public ResponseEntity<AgentPipelineResponse> reportIncident(
            @Valid @RequestBody IncidentReportRequest request,
            @AuthenticationPrincipal SecurityUser principal) {

        User reporter = principal.getUser();
        AgentPipelineResponse response = incidentService.submitReportAndRunPipeline(
                request, reporter.getTenant(), reporter);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponse>> listIncidents(@AuthenticationPrincipal SecurityUser principal) {
        UUID tenantId = principal.getUser().getTenant().getId();
        return ResponseEntity.ok(incidentService.listForTenant(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncident(@PathVariable UUID id) {
        return ResponseEntity.ok(incidentService.getOne(id));
    }
}
