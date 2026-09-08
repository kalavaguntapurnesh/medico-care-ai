package com.medicocareai.backend.dto.doctor;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDoctorRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Specialization is required")
    @Size(max = 150, message = "Specialization must not exceed 150 characters")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    @Size(max = 255, message = "Qualification must not exceed 255 characters")
    private String qualification;

    @NotNull(message = "Experience years is required")
    @PositiveOrZero(message = "Experience years cannot be negative")
    private Integer experienceYears;

    @DecimalMin(
        value = "0.00",
        inclusive = true,
        message = "Consultation fee cannot be negative"
    )
    private BigDecimal consultationFee;

    @Size(max = 100, message = "License number must not exceed 100 characters")
    private String licenseNumber;

    @Size(max = 5000, message = "Bio must not exceed 5000 characters")
    private String bio;
}