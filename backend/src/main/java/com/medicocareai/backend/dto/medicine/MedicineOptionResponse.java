package com.medicocareai.backend.dto.medicine;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MedicineOptionResponse {
    private UUID id;
    private String name;
    private String genericName;
    private String strength;
    private String form;
}
