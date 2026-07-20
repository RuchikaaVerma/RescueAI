package com.rescueai.os.domain.entity;

import com.rescueai.os.domain.enums.AlertChannel;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/** Output of the Communication Agent: a message actually sent to some audience. */
@Entity
@Table(name = "alert_broadcasts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertBroadcast {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertChannel channel;

    @Column(nullable = false)
    private String language;

    /** e.g. CITIZENS, HOSPITALS, GOVERNMENT, VOLUNTEERS, ALL */
    @Column(nullable = false)
    private String audience;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private Instant sentAt = Instant.now();
}
