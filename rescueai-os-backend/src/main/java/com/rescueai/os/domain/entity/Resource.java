package com.rescueai.os.domain.entity;

import com.rescueai.os.domain.enums.ResourceStatus;
import com.rescueai.os.domain.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/** A dispatchable unit: ambulance, truck, helicopter, boat, medical-kit stock, etc. */
@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(nullable = false)
    private String identifier; // e.g. plate number, asset tag

    @Builder.Default
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    private Double latitude;
    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_incident_id")
    private Incident assignedIncident;
}
