package com.rescueai.os.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * A Tenant is what makes RescueAI OS a platform rather than a single app.
 * Each deployment (district, hospital network, campus, industrial plant, event)
 * is a Tenant with its own config — same core code, different behavior.
 */
@Entity
@Table(name = "tenants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug; // e.g. "delhi-district-admin", "iit-campus", "acme-plant"

    @Column(nullable = false)
    private String displayName;

    /** e.g. DISTRICT_ADMIN, SMART_CITY, INDUSTRIAL_PLANT, UNIVERSITY, MILITARY, EVENT */
    @Column(nullable = false)
    private String tenantType;

    /** Free-form JSON config: enabled agents, alert templates, SOP corpus ids, locale, etc. */
    @Column(columnDefinition = "TEXT")
    private String configJson;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
