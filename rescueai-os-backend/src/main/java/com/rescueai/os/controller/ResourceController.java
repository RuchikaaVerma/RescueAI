package com.rescueai.os.controller;

import com.rescueai.os.domain.entity.Resource;
import com.rescueai.os.repository.ResourceRepository;
import com.rescueai.os.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    public ResponseEntity<List<Resource>> list(@AuthenticationPrincipal SecurityUser principal) {
        return ResponseEntity.ok(resourceRepository.findByTenantId(principal.getUser().getTenant().getId()));
    }
}
