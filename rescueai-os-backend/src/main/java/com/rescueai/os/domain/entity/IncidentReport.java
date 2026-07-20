package com.rescueai.os.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/** A single raw submission from a citizen/sensor. Multiple reports can collapse into one Incident. */
@Entity
@Table(name = "incident_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    private Incident incident; // nullable until Verification Agent links/creates one

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id")
    private User reportedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rawText;

    private Double latitude;
    private Double longitude;

    /** Comma-separated media URLs (photos/videos) uploaded with the report. */
    @Column(columnDefinition = "TEXT")
    private String mediaUrls;

    @Builder.Default
    private Instant submittedAt = Instant.now();
}
