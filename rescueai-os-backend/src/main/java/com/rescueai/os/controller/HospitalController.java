package com.rescueai.os.controller;

import com.rescueai.os.domain.entity.Hospital;
import com.rescueai.os.repository.HospitalRepository;
import com.rescueai.os.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalRepository hospitalRepository;

    @GetMapping
    public ResponseEntity<List<Hospital>> list(@AuthenticationPrincipal SecurityUser principal) {
        return ResponseEntity.ok(hospitalRepository.findByTenantId(principal.getUser().getTenant().getId()));
    }

    @PatchMapping("/{id}/load")
    public ResponseEntity<Hospital> updateLoad(@PathVariable java.util.UUID id, @RequestParam int currentLoad) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new com.rescueai.os.exception.ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Hospital not found"));
        hospital.setCurrentLoad(currentLoad);
        return ResponseEntity.ok(hospitalRepository.save(hospital));
    }
}
