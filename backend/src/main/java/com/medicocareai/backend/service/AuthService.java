
package com.medicocareai.backend.service;

import java.time.LocalDateTime;

import com.medicocareai.backend.dto.auth.LoginRequest;
import com.medicocareai.backend.dto.auth.LoginResponse;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.exception.BadRequestException;
import com.medicocareai.backend.security.JwtService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserService userService,
            JwtService jwtService,
            AuditLogService auditLogService) {

        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    public LoginResponse login(
            LoginRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

        } catch (AuthenticationException exception) {

            log.error(
                    "Authentication failed for user: {}",
                    request.getEmail(),
                    exception);

            String metadata = "{\"email\":\"" + escapeJson(request.getEmail()) + "\"}";

            auditLogService.log(
                    null,
                    "LOGIN_FAILED",
                    "USER",
                    null,
                    ipAddress,
                    userAgent,
                    metadata);

            throw new BadRequestException(
                    "Invalid email or password");
        }

        User user = userService.findUserByEmail(
                request.getEmail());

        if (!"ACTIVE".equals(user.getStatus())) {

            auditLogService.log(
                    user.getId(),
                    "LOGIN_BLOCKED",
                    "USER",
                    user.getId(),
                    ipAddress,
                    userAgent,
                    "{\"reason\":\"ACCOUNT_NOT_ACTIVE\"}");

            throw new BadRequestException(
                    "User account is not active");
        }

        user.setLastLoginAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userService.updateUser(user);

        String role = user.getRole() != null
                ? user.getRole().getName()
                : "USER";

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                role);

        auditLogService.log(
                user.getId(),
                "LOGIN_SUCCESS",
                "USER",
                user.getId(),
                ipAddress,
                userAgent,
                "{\"role\":\"" + escapeJson(role) + "\"}");

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(3600)
                .userId(user.getId())
                .email(user.getEmail())
                .role(role)
                .build();
    }

    private String getClientIpAddress(
            HttpServletRequest request) {

        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null
                && !forwardedFor.isBlank()) {

            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");

        if (realIp != null
                && !realIp.isBlank()) {

            return realIp;
        }

        return request.getRemoteAddr();
    }

    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}
