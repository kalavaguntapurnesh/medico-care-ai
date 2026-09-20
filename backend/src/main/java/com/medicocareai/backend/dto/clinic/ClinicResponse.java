package com.medicocareai.backend.dto.clinic;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClinicResponse {

    private UUID id;

    private String name;

    private String addressLine1;

    private String addressLine2;

    private String city;

    private String postcode;

    private String phoneNumber;

    private String email;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
