package com.rescueai.os.domain.entity;

import com.rescueai.os.domain.enums.AgentName;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit trail: every decision any agent makes is logged here.
 * This table is what makes Phase 2 (research: outcome analysis, override rates,
 * accuracy vs. baseline) and Phase 3 (compliance/audit for government customers) possible.
 */
@Entity
@Table(name = "agent_actions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AgentAction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentName agentName;

    @Column(columnDefinition = "TEXT")
    private String inputSummary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String outputJson;

    /** Model self-reported or heuristic confidence, [0.0-1.0]. */
    private Double confidence;

    /** Whether a human operator later overrode this agent's decision — key research metric. */
    @Builder.Default
    private boolean overridden = false;

    @Column(columnDefinition = "TEXT")
    private String overrideReason;

    private Long latencyMs;

    @Builder.Default
    private Instant timestamp = Instant.now();
}
