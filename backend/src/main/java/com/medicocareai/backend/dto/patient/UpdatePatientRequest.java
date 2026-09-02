package com.medicocareai.backend.dto.patient;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePatientRequest {

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 30, message = "Gender must not exceed 30 characters")
    private String gender;

    @Size(max = 10, message = "Blood group must not exceed 10 characters")
    private String bloodGroup;

    @DecimalMin(value = "0.01", message = "Height must be greater than zero")
    @DecimalMax(value = "300.00", message = "Height must not exceed 300 cm")
    private BigDecimal heightCm;

    @DecimalMin(value = "0.01", message = "Weight must be greater than zero")
    @DecimalMax(value = "500.00", message = "Weight must not exceed 500 kg")
    private BigDecimal weightKg;

    @Size(max = 150, message = "Emergency contact name must not exceed 150 characters")
    private String emergencyContactName;

    @Size(max = 30, message = "Emergency contact phone must not exceed 30 characters")
    private String emergencyContactPhone;
}
