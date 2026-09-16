package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.medicinereminder.CreateMedicineReminderRequest;
import com.medicocareai.backend.dto.medicinereminder.MedicineReminderResponse;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.service.MedicineReminderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/medicine-reminders")
public class MedicineReminderController {

    private final MedicineReminderService medicineReminderService;

    public MedicineReminderController(MedicineReminderService medicineReminderService) {
        this.medicineReminderService = medicineReminderService;
    }

    @PostMapping
    public ResponseEntity<MedicineReminderResponse> createReminder(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateMedicineReminderRequest request) {
        MedicineReminderResponse response = medicineReminderService.createReminder(principal, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<MedicineReminderResponse>> getMyReminders(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(medicineReminderService.getMyReminders(principal));
    }

    @GetMapping("/me/{reminderId}")
    public ResponseEntity<MedicineReminderResponse> getMyReminder(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID reminderId) {
        return ResponseEntity.ok(medicineReminderService.getMyReminder(principal, reminderId));
    }

    @DeleteMapping("/me/{reminderId}")
    public ResponseEntity<Void> deactivateReminder(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID reminderId) {
        medicineReminderService.deactivateReminder(principal, reminderId);
        return ResponseEntity.noContent().build();
    }
}
