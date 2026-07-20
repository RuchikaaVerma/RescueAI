package com.rescueai.os.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * A chunk of a Standard Operating Procedure / disaster manual, embedded for RAG.
 * Agents (Medical, Infrastructure, Communication) retrieve against this table
 * so outputs are grounded in real protocols instead of free-floating LLM guesses.
 */
@Entity
@Table(name = "sop_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SopDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant; // null = global/shared SOP

    @Column(nullable = false)
    private String title;

    /** e.g. MEDICAL, INFRASTRUCTURE, EVACUATION, COMMUNICATION */
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Embedding vector stored as a plain float array via a custom Hibernate type,
     * OR left null here and stored in pgvector through a native query / separate
     * vector store service — kept simple (TEXT of comma-floats) for MVP portability.
     */
    @Column(columnDefinition = "TEXT")
    private String embeddingJson;
}
