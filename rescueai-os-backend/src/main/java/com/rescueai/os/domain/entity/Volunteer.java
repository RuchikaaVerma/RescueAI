package com.rescueai.os.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "volunteers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** Comma-separated: FIRST_AID, SWIMMING, DRIVING, TRANSLATION, LOGISTICS, MEDICAL ... */
    private String skills;

    @Builder.Default
    private boolean available = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_incident_id")
    private Incident assignedIncident;

    private String currentTask;
}
