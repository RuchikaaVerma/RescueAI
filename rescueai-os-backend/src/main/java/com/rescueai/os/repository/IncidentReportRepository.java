package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, UUID> {
    List<IncidentReport> findByIncidentId(UUID incidentId);
}
