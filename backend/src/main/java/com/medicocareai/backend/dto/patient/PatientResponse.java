package com.medicocareai.backend.dto.patient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PatientResponse {
    private UUID id;

    private UUID userId;

    private String email;

    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    private BigDecimal heightCm;

    private BigDecimal weightKg;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
