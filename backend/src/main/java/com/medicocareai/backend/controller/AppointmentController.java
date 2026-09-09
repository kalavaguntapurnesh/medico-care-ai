package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.appointment.AppointmentResponse;
import com.medicocareai.backend.dto.appointment.CreateAppointmentRequest;
import com.medicocareai.backend.dto.appointment.UpdateAppointmentStatusRequest;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.service.AppointmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            Authentication authentication,
            @Valid @RequestBody CreateAppointmentRequest request) {

        UUID patientUserId = getUserId(authentication);

        AppointmentResponse response = appointmentService.createAppointment(patientUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(
            Authentication authentication) {
        UUID patientUserId = getUserId(authentication);

        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientUserId));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<AppointmentResponse> getPatientAppointment(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID patientUserId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.getPatientAppointment(patientUserId, id));
    }

    @PutMapping("/me/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID patientUserId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.cancelAppointment(patientUserId, id));
    }

    @GetMapping("/doctor/me")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(
            Authentication authentication) {
        UUID doctorUserId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorUserId));
    }

    @GetMapping("/doctor/me/{id}")
    public ResponseEntity<AppointmentResponse> getDoctorAppointment(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID doctorUserId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.getDoctorAppointment(doctorUserId, id));
    }

    @PutMapping("/doctor/me/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAppointmentStatusRequest request) {
        UUID doctorUserId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(doctorUserId, id, request));
    }

    // helper

    private UUID getUserId(Authentication authentication) {

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        return principal.getUserId();

    }
}
