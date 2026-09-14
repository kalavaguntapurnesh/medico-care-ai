package com.medicocareai.backend.dto.prescription;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PrescriptionItemResponse {

    private UUID id;

    private UUID medicineId;

    private String medicineName;

    private String genericName;

    private String strength;

    private String form;

    private String dosage;

    private String frequency;

    private Integer durationDays;

    private String instructions;
}