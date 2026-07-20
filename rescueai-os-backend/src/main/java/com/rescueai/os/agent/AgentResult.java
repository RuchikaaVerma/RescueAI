package com.rescueai.os.agent;

import com.rescueai.os.domain.enums.AgentName;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AgentResult {
    private final AgentName agentName;
    private final String outputJson;
    private final double confidence;
    private final long latencyMs;
}
