package com.rescueai.os.repository;

import com.rescueai.os.domain.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VolunteerRepository extends JpaRepository<Volunteer, UUID> {
    List<Volunteer> findByAvailableTrue();
}
