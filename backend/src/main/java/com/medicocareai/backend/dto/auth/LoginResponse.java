package com.medicocareai.backend.dto.auth;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    
    private String accessToken;

    private String tokenType;

    private long expiresIn;

    private UUID userId;

    private String email;

    private String role;
}
