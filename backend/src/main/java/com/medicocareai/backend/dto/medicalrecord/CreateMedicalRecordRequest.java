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


    @PastOrPresent(message = "Record date cannot be in the future")
    private LocalDate recordDate;
}
