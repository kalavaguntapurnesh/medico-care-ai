package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.doctoravailability.CreateDoctorAvailabilityRequest;
import com.medicocareai.backend.dto.doctoravailability.DoctorAvailabilityResponse;
import com.medicocareai.backend.dto.doctoravailability.UpdateDoctorAvailabilityRequest;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.service.DoctorAvailabilityService;

import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;

@RestController
@RequestMapping("/api/v1/doctors/me/availability")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    public DoctorAvailabilityController(
            DoctorAvailabilityService doctorAvailabilityService) {
        this.doctorAvailabilityService = doctorAvailabilityService;
    }

    @PostMapping
    public ResponseEntity<DoctorAvailabilityResponse> createAvailability(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateDoctorAvailabilityRequest request) {
        DoctorAvailabilityResponse response = doctorAvailabilityService.createAvailability(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DoctorAvailabilityResponse>> getMyAvailability(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(doctorAvailabilityService.getMyAvailability(principal));
    }

    @PutMapping("/{availabilityId}")
    public ResponseEntity<DoctorAvailabilityResponse> updateAvailability(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID availabilityId,
            @Valid @RequestBody UpdateDoctorAvailabilityRequest request) {
        DoctorAvailabilityResponse response = doctorAvailabilityService.updateAvailability(principal, availabilityId,
                request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<Void> deactivateAvailability(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID availabilityId) {

        doctorAvailabilityService.deactivateAvailability(
                principal,
                availabilityId);

        return ResponseEntity.noContent().build();
    }

}
