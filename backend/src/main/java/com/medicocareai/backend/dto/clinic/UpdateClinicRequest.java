package com.medicocareai.backend.dto.clinic;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateClinicRequest {

    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String addressLine1;

    @Size(max = 255)
    private String addressLine2;

    @Size(max = 100)
    private String city;

    @Size(max = 30)
    private String postcode;

    @Size(max = 30)
    private String phoneNumber;

    @Email
    @Size(max = 255)
    private String email;

    private Boolean active;
}
