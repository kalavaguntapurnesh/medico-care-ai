package com.medicocareai.backend.service;

import java.time.LocalDateTime;

import com.medicocareai.backend.exception.BadRequestException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import com.medicocareai.backend.dto.auth.LoginRequest;
import com.medicocareai.backend.dto.auth.LoginResponse;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.security.JwtService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;

    private final UserService userService;

    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserService userService,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (AuthenticationException exception) {
            log.error("Authentication failed for user: {}", request.getEmail(), exception);
            throw new BadRequestException("Invalid email or password");

        }

        User user = userService.findUserByEmail(
                request.getEmail());

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("User account is not active");
        }
        user.setLastLoginAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userService.updateUser(user);

        String role = user.getRole() != null ? user.getRole().getName() : "USER";

        String token = jwtService.generateToken(user.getId(), user.getEmail(), role);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(3600)
                .userId(user.getId())
                .email(user.getEmail())
                .role(role)
                .build();

    }
}
