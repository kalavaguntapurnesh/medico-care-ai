package com.medicocareai.backend.dto.doctoravailability;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DoctorAvailabilityResponse {

    private UUID id;

    private UUID doctorId;

    private Short dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
