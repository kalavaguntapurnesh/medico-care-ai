package com.medicocareai.backend.dto.prescription;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePrescriptionRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;

    @NotNull(message = "Prescription date is required")
    @PastOrPresent(message = "Prescription date cannot be in the future")
    private LocalDate prescriptionDate;

    @Size(max = 5000, message = "Notes must not exceed 5000 characters")
    private String notes;

    @NotEmpty(message = "At least one medicine is required")
    @Valid
    private List<PrescriptionItemRequest> items;
}
