package com.medicocareai.backend.dto.prescription;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;


@Getter 
@Builder 
public class PrescriptionResponse {

    private UUID id;

    private UUID patientId;

    private UUID doctorId;

    private UUID appointmentId;

    private LocalDate prescriptionDate;

    private String notes;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<PrescriptionItemResponse> items;
}
