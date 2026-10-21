package com.medicocareai.backend.dto.medicalrecord;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MedicalRecordResponse {

    private UUID id;

    private UUID patientId;

    private UUID uploadedBy;

    private String uploadedByEmail;

    private String recordType;

    private String title;

    private String description;

    private String fileName;

    private String downloadUrl;

    private String mimeType;

    private Long fileSize;

    private LocalDate recordDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;
}
