package com.medicocareai.backend.dto.medicalrecord;

import java.time.LocalDate;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMedicalRecordRequest {

    @Size(max = 50, message = "Record type must not exceed 50 characters")
    private String recordType;

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Size(max = 255, message = "File name must not exceed 255 characters")
    private String fileName;

    private String filePath;

    @Size(max = 100, message = "MIME type must not exceed 100 characters")
    private String mimeType;

    private Long fileSize;

    @PastOrPresent(message = "Record date cannot be in the future")
    private LocalDate recordDate;

}
