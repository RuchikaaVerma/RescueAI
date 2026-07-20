package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    List<Hospital> findByTenantId(UUID tenantId);
}
