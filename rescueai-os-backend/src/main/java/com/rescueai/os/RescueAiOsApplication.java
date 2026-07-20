package com.rescueai.os;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * RescueAI OS — Agentic AI Operating System for Disaster Intelligence,
 * Coordination and Autonomous Decision Support.
 *
 * Entry point. The system boots as:
 *   Spring Boot API layer -> AI Agent Orchestrator -> PostgreSQL / Redis
 */
@SpringBootApplication
@EnableAsync
@EnableCaching
public class RescueAiOsApplication {

    public static void main(String[] args) {
        SpringApplication.run(RescueAiOsApplication.class, args);
    }
}
