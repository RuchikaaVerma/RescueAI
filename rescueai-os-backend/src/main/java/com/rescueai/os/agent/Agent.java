package com.rescueai.os.agent;

import com.rescueai.os.domain.enums.AgentName;

/** Every specialized agent (Detection, Verification, Resource Planner, ...) implements this. */
public interface Agent {

    AgentName name();

    /** Runs this agent's task against the shared context and returns its structured result. */
    AgentResult execute(AgentContext context);
}
