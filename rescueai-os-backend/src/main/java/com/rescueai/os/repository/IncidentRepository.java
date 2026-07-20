package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.Incident;
import com.rescueai.os.domain.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    List<Incident> findByTenantIdOrderByReportedAtDesc(UUID tenantId);

    List<Incident> findByTenantIdAndStatus(UUID tenantId, IncidentStatus status);

    /** Naive geo-proximity query for dedup: finds recent incidents within ~roughly `degrees` of lat/lng. */
    @Query("""
           SELECT i FROM Incident i
           WHERE i.tenant.id = :tenantId
             AND i.status NOT IN (com.rescueai.os.domain.enums.IncidentStatus.REJECTED_DUPLICATE,
                                   com.rescueai.os.domain.enums.IncidentStatus.REJECTED_FALSE,
                                   com.rescueai.os.domain.enums.IncidentStatus.CLOSED)
             AND ABS(i.latitude - :lat) < :degrees
             AND ABS(i.longitude - :lng) < :degrees
           ORDER BY i.reportedAt DESC
           """)
    List<Incident> findNearbyActive(@Param("tenantId") UUID tenantId,
                                     @Param("lat") double lat,
                                     @Param("lng") double lng,
                                     @Param("degrees") double degrees);
}
