package com.rescueai.os.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Thin wrapper so services/agents don't need to know STOMP destination
 * conventions directly. Frontend subscribes to these topics for the
 * live map, incident timeline, and AI Command Center pipeline view.
 */
@Component
@RequiredArgsConstructor
public class AlertBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastIncidentUpdate(Object incidentPayload) {
        messagingTemplate.convertAndSend("/topic/incidents", incidentPayload);
    }

    public void broadcastAgentStep(String incidentId, String agentName, Object stepPayload) {
        messagingTemplate.convertAndSend("/topic/agent-pipeline/" + incidentId,
                Map.of("agent", agentName, "data", stepPayload));
    }

    public void broadcastAlert(Object alertPayload) {
        messagingTemplate.convertAndSend("/topic/alerts", alertPayload);
    }
}
