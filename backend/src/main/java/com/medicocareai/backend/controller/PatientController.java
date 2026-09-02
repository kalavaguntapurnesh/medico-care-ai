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

import com.medicocareai.backend.dto.patient.CreatePatientRequest;
import com.medicocareai.backend.dto.patient.PatientResponse;
import com.medicocareai.backend.dto.patient.UpdatePatientRequest;
import com.medicocareai.backend.service.PatientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/me")
    public ResponseEntity<PatientResponse> createPatient(
            Authentication authentication,
            @Valid @RequestBody CreatePatientRequest request) {
        String email = authentication.getName();

        PatientResponse response = patientService.createPatientByEmail(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<PatientResponse> getCurrentPatient(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(patientService.getPatientByEmail(email));
    }

    @PutMapping("/me")
    public ResponseEntity<PatientResponse> updateCurrentPatient(
        Authentication authentication,
        @Valid @RequestBody UpdatePatientRequest request
    ){
        String email = authentication.getName();
        return ResponseEntity.ok(
            patientService.updatePatientByEmail(
                email,
                request
            )
        );
    }

}
