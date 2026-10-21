package com.medicocareai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.medicine.MedicineOptionResponse;
import com.medicocareai.backend.entity.Medicine;
import com.medicocareai.backend.repository.MedicineRepository;

@RestController
@RequestMapping("/api/v1/medicines")
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(
            MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/active")
    public ResponseEntity<List<MedicineOptionResponse>> getActiveMedicines() {
        List<MedicineOptionResponse> medicines = medicineRepository.findByActiveTrue().stream().map(this::toResponse)
                .toList();

        return ResponseEntity.ok(medicines);
    }

    private MedicineOptionResponse toResponse(Medicine medicine) {
        return MedicineOptionResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .strength(medicine.getStrength())
                .form(medicine.getForm())
                .build();
    }

}
