package com.medicocareai.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.doctor.AvailableSlotResponse;
import com.medicocareai.backend.service.DoctorSlotService;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorSlotController {

    private final DoctorSlotService doctorSlotService;

    public DoctorSlotController(
            DoctorSlotService doctorSlotService) {
        this.doctorSlotService = doctorSlotService;
    }

    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<List<AvailableSlotResponse>> getAvailableSlots(
            @PathVariable UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorSlotService.getAvailableSlots(doctorId, date));
    }

}
