package com.medicocareai.backend.dto.prescription;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrescriptionItemRequest {

    @NotNull(message = "Medicine ID is required")
    private UUID medicineId;

    @NotBlank(message = "Dosage is required")
    @Size(max = 100, message = "Dosage must not exceed 100 characters")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100, message = "Frequency must not exceed 100 characters")
    private String frequency;

    @Positive(message = "Duration must be greater than zero")
    private Integer durationDays;

    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;
}
