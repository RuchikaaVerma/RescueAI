package com.rescueai.os.agent;

import com.rescueai.os.domain.entity.Incident;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

/**
 * Threaded through the whole pipeline. Each agent reads what previous agents
 * produced (via `blackboard`) and writes its own output back — this is the
 * shared-memory "blackboard" coordination pattern, deliberately simple and
 * inspectable rather than a black box.
 */
@Getter
@Builder
public class AgentContext {

    private final Incident incident;
    private final String rawReportText;

    @Builder.Default
    private final Map<String, Object> blackboard = new HashMap<>();

    public void publish(String key, Object value) {
        blackboard.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> T read(String key) {
        return (T) blackboard.get(key);
    }
}
