package com.rescueai.os.controller;

import com.rescueai.os.domain.entity.AgentAction;
import com.rescueai.os.repository.AgentActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** Exposes the audit trail — what the "AI Command Center" pipeline visualizer and
 *  Phase-2 research analysis both read from. */
@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentActionRepository agentActionRepository;

    @GetMapping("/incidents/{incidentId}/actions")
    public ResponseEntity<List<AgentAction>> getActionsForIncident(@PathVariable UUID incidentId) {
        return ResponseEntity.ok(agentActionRepository.findByIncidentIdOrderByTimestampAsc(incidentId));
    }

    @PatchMapping("/actions/{actionId}/override")
    public ResponseEntity<AgentAction> overrideAction(@PathVariable UUID actionId, @RequestParam String reason) {
        AgentAction action = agentActionRepository.findById(actionId)
                .orElseThrow(() -> new com.rescueai.os.exception.ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Agent action not found"));
        action.setOverridden(true);
        action.setOverrideReason(reason);
        return ResponseEntity.ok(agentActionRepository.save(action));
    }
}
