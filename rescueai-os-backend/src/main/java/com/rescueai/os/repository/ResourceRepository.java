package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.Resource;
import com.rescueai.os.domain.enums.ResourceStatus;
import com.rescueai.os.domain.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByTenantId(UUID tenantId);
    List<Resource> findByTenantIdAndStatus(UUID tenantId, ResourceStatus status);
    List<Resource> findByTenantIdAndTypeAndStatus(UUID tenantId, ResourceType type, ResourceStatus status);
}
