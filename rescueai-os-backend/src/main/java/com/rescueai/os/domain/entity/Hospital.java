package com.rescueai.os.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "hospitals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private Integer totalCapacity;

    @Builder.Default
    private Integer currentLoad = 0;

    /** Comma-separated: TRAUMA, BURNS, ICU, PEDIATRIC, ORTHOPEDIC ... */
    private String specialties;

    @Builder.Default
    private Integer bloodBankUnitsAvailable = 0;

    @Column(nullable = false)
    private String contactNumber;

    public int availableBeds() {
        return Math.max(0, totalCapacity - currentLoad);
    }
}
