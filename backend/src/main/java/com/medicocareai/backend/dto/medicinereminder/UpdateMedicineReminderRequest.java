package com.medicocareai.backend.dto.medicinereminder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMedicineReminderRequest {

    private UUID medicineId;

    @Size(max = 100, message = "Dosage must not exceed 100 characters")
    private String dosage;

    @Size(max = 100, message = "Frequency must not exceed 100 characters")
    private String frequency;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime reminderTime;

    private Boolean active;
}
