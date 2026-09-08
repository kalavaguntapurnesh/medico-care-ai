package com.medicocareai.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.doctor.CreateDoctorRequest;
import com.medicocareai.backend.dto.doctor.DoctorResponse;
import com.medicocareai.backend.dto.doctor.UpdateDoctorRequest;
import com.medicocareai.backend.service.DoctorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorController {
    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        DoctorResponse response = doctorService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }

    @GetMapping("/me")
    public ResponseEntity<DoctorResponse> getCurrentDoctor(Authentication authentication) {
        String email = authentication.getName();

        // i will add in next phase
        return ResponseEntity.ok(doctorService.getDoctorByEmail(email));
    }

    @PutMapping("/me")
    public ResponseEntity<DoctorResponse> updateCurrentDoctor(Authentication authentication,
            @Valid @RequestBody UpdateDoctorRequest request) {
        String email = authentication.getName();

        // this one also
        return ResponseEntity.ok(doctorService.updateDoctorByEmail(email, request));
    }
}
