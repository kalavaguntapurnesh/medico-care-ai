package com.medicocareai.backend.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private UUID id;

    private String email;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private String role;

    private String status;

    private boolean emailVerified;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
