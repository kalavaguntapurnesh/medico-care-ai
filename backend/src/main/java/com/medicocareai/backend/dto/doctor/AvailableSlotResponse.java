package com.medicocareai.backend.dto.doctor;

import java.time.LocalTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AvailableSlotResponse {
    private LocalTime startTime;

    private LocalTime endTime;
}
