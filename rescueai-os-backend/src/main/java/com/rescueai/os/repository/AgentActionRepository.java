package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.AgentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AgentActionRepository extends JpaRepository<AgentAction, UUID> {
    List<AgentAction> findByIncidentIdOrderByTimestampAsc(UUID incidentId);
}
