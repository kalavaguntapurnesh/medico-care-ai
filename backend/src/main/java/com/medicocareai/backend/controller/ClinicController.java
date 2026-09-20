package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.clinic.ClinicResponse;
import com.medicocareai.backend.dto.clinic.CreateClinicRequest;
import com.medicocareai.backend.dto.clinic.UpdateClinicRequest;
import com.medicocareai.backend.service.ClinicService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/clinics")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @PostMapping
    public ResponseEntity<ClinicResponse> createClinic(
            @Valid @RequestBody CreateClinicRequest request) {
        ClinicResponse response = clinicService.createClinic(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ClinicResponse>> getAllClinics() {
        return ResponseEntity.ok(clinicService.getAllActiveClinics());
    }

    @GetMapping("/{clinicId}")
    public ResponseEntity<ClinicResponse> getClinicByIdEntity(
            @PathVariable UUID clinicId) {
        return ResponseEntity.ok(clinicService.getClinicById(clinicId));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<ClinicResponse>> getClinicsByCity(
            @PathVariable String city) {
        return ResponseEntity.ok(clinicService.getClinicsByCity(city));
    }

    @PutMapping("/{clinicId}")
    public ResponseEntity<ClinicResponse> updateClinic(
            @PathVariable UUID clinicId,
            @Valid @RequestBody UpdateClinicRequest request) {
        return ResponseEntity.ok(clinicService.updateClinic(clinicId, request));
    }

    @DeleteMapping("/{clinicId}")
    public ResponseEntity<Void> deactivateClinic(
            @PathVariable UUID clinicId) {
        clinicService.deactivateClinic(clinicId);
        return ResponseEntity.noContent().build();
    }
}
