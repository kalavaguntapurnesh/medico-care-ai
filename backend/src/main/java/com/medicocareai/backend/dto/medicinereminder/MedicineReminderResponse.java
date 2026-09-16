package com.medicocareai.backend.dto.medicinereminder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter 
@Builder 
public class MedicineReminderResponse {
    private UUID id;

    private UUID patientId;

    private UUID medicineId;

    private String medicineName;

    private String genericName;

    private String strength;

    private String form;

    private String dosage;

    private String frequency;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime reminderTime;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
