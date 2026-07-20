package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.AlertBroadcast;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AlertBroadcastRepository extends JpaRepository<AlertBroadcast, UUID> {
    List<AlertBroadcast> findByIncidentId(UUID incidentId);
}
