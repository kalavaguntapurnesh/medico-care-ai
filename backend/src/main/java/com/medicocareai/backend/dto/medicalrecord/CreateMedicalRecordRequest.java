package com.medicocareai.backend.dto.medicalrecord;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMedicalRecordRequest {

    @NotBlank(message = "Record type is required")
    @Size(max = 50, message = "Record type must not exceed 50 characters")
    private String recordType;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name must not exceed 255 characters")
    private String fileName;

    @NotBlank(message = "File path is required")
    private String filePath;

    @NotBlank(message = "MIME type is required")
    @Size(max = 100, message = "MIME type must not exceed 100 characters")
    private String mimeType;

    private Long fileSize;

    @PastOrPresent(message = "Record date cannot be in the future")
    private LocalDate recordDate;
}
