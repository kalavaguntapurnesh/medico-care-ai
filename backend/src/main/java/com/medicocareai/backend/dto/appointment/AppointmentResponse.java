package com.medicocareai.backend.dto.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AppointmentResponse {

    private UUID id;

    private UUID patientId;

    private UUID doctorId;

    private String patientEmail;

    private String patientFirstName;

    private String patientLastName;

    private String doctorEmail;

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorSpecialization;

    private LocalDate appointmentDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String status;

    private String reason;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
