package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.SopDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SopDocumentRepository extends JpaRepository<SopDocument, java.util.UUID> {
    List<SopDocument> findByCategory(String category);
}
