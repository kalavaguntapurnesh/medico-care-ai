package com.medicocareai.backend.dto.appointment;

import com.medicocareai.backend.enums.AppointmentStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAppointmentStatusRequest {

    @NotNull(message = "Appoinment status is required")
    private AppointmentStatus status;
}
