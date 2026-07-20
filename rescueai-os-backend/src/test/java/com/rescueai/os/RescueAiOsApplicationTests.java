package com.rescueai.os;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** Smoke test: verifies the whole Spring context (entities, repos, security, agents) wires up. */
@SpringBootTest
@ActiveProfiles("test")
class RescueAiOsApplicationTests {

    @Test
    void contextLoads() {
        // If the application context fails to start, this test fails —
        // catches misconfigured beans (security, JPA, agent wiring) early.
    }
}
