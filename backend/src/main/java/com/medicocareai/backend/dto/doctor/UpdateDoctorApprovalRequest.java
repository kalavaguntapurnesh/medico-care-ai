package com.medicocareai.backend.dto.doctor;

import com.medicocareai.backend.enums.DoctorApprovalStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDoctorApprovalRequest {

    @NotNull(message = "Approval status is required")
    private DoctorApprovalStatus approvalStatus;
}
