package com.rescueai.os.domain.entity;

import com.rescueai.os.domain.enums.IncidentStatus;
import com.rescueai.os.domain.enums.IncidentType;
import com.rescueai.os.domain.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * The central unit of coordination. Every agent reads from and writes
 * decisions back onto an Incident (directly or via AgentAction records).
 */
@Entity
@Table(name = "incidents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private IncidentType type = IncidentType.UNVERIFIED;

    @Enumerated(EnumType.STRING)
    private SeverityLevel severityLevel;

    /** Raw 1-10 score produced by the Emergency Detection / Severity Prediction agents. */
    private Integer severityScore;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.REPORTED;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Predicted spread radius in meters, filled by Severity & Spread Prediction Agent. */
    @Column(name = "predicted_spread_radius_m")
    private Double predictedSpreadRadiusM;

    /** Groups duplicate reports of the same real-world event, set by the Verification Agent. */
    private UUID dedupGroupId;

    /** Confidence [0.0-1.0] that this incident is real, set by the Verification Agent. */
    private Double verificationConfidence;

    @Builder.Default
    private Instant reportedAt = Instant.now();

    private Instant resolvedAt;
}