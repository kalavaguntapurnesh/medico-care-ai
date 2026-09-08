package com.medicocareai.backend.dto.doctor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DoctorResponse {
    private UUID id;

    private UUID userId;

    private String email;

    private String firstName;

    private String lastName;

    private String specialization;

    private String qualification;

    private Integer experienceYears;

    private BigDecimal consultationFee;

    private String licenseNumber;

    private String approvalStatus;

    private String bio;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
