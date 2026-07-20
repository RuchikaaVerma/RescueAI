package com.rescueai.os.controller;

import com.rescueai.os.domain.entity.Volunteer;
import com.rescueai.os.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerRepository volunteerRepository;

    @GetMapping("/available")
    public ResponseEntity<List<Volunteer>> available() {
        return ResponseEntity.ok(volunteerRepository.findByAvailableTrue());
    }
}
