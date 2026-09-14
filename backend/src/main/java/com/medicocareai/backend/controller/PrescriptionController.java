package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.prescription.CreatePrescriptionRequest;
import com.medicocareai.backend.dto.prescription.PrescriptionResponse;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.service.PrescriptionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(
            PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<PrescriptionResponse> createPrescrption(
            Authentication authentication,
            @Valid @RequestBody CreatePrescriptionRequest request) {
        UUID doctorUserId = getUserId(authentication);
        PrescriptionResponse response = prescriptionService.createPrescription(doctorUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions(
            Authentication authentication) {
        UUID patientUserId = getUserId(authentication);
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientUserId));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<PrescriptionResponse> getPatientPrescription(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID patientUserId = getUserId(authentication);
        return ResponseEntity.ok(prescriptionService.getPatientPrescription(patientUserId, id));
    }

    @GetMapping("/doctor/me")
    public ResponseEntity<List<PrescriptionResponse>> getDoctorPrescriptions(
            Authentication authentication) {
        UUID doctorUserId = getUserId(authentication);
        return ResponseEntity.ok(prescriptionService.getDoctorPrescriptions(doctorUserId));
    }

    @GetMapping("/doctor/me/{id}")
    public ResponseEntity<PrescriptionResponse> getDoctorPrescription(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID doctorUserId = getUserId(authentication);
        return ResponseEntity.ok(prescriptionService.getDoctorPrescription(doctorUserId, id));
    }

    private UUID getUserId(Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        return principal.getUserId();
    }

}
