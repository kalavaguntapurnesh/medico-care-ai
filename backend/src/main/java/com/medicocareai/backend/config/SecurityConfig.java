package com.medicocareai.backend.config;

import com.medicocareai.backend.security.CustomerUserDetailsService;
import com.medicocareai.backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider(
                        CustomerUserDetailsService userDetailsService,
                        PasswordEncoder passwordEncoder) {

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
                provider.setPasswordEncoder(passwordEncoder);
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        DaoAuthenticationProvider authenticationProvider) {
                return authentication -> authenticationProvider.authenticate(authentication);
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        DaoAuthenticationProvider authenticationProvider,
                        JwtAuthenticationFilter jwtAuthenticationFilter)
                        throws Exception {

                http
                                .authenticationProvider(authenticationProvider)

                                .cors(cors -> {
                                })

                                .csrf(AbstractHttpConfigurer::disable)

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .exceptionHandling(exception -> exception.authenticationEntryPoint(
                                                (request, response, authException) -> {
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");

                                                        response.getWriter().write("""
                                                                        {
                                                                            "error": "Unauthorized",
                                                                            "status": 401,
                                                                            "message": "Authentication required"
                                                                        }
                                                                        """);
                                                }))

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()

                                                .requestMatchers(HttpMethod.GET, "/api/v1/users/me")
                                                .authenticated()

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/users/me")
                                                .authenticated()

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/users/me/password")
                                                .authenticated()

                                                .requestMatchers(HttpMethod.GET, "/api/v1/users/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/users/*/status")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/users/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.POST, "/api/v1/patients/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.GET, "/api/v1/patients/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/patients/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.POST, "/api/v1/doctors")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.GET, "/api/v1/doctors/me")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/doctors/me")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(HttpMethod.POST, "/api/v1/doctors")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/doctors/*/approval")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.GET, "/api/v1/doctors/me")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/doctors/me")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/appointments")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/appointments/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/appointments/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/appointments/me/*/cancel")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/appointments/doctor/me")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/appointments/doctor/me/*")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/appointments/doctor/me/*/status")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(HttpMethod.POST, "/api/v1/medical-records")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.GET, "/api/v1/medical-records/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.GET, "/api/v1/medical-records/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.PUT, "/api/v1/medical-records/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/medical-records/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/medical-records/uploaded-by-me")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/medical-records/patient/*")
                                                .hasRole("DOCTOR")

                                                // prescriptions

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/prescriptions")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/prescriptions/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/prescriptions/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/prescriptions/doctor/me")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/prescriptions/doctor/me/*")
                                                .hasRole("DOCTOR")

                                                // doctors availablility

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/doctors/me/availability")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/doctors/me/availability")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/doctors/me/availability/*")
                                                .hasRole("DOCTOR")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/v1/doctors/me/availability/*")
                                                .hasRole("DOCTOR")

                                                // reminders

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/medicine-reminders")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/medicine-reminders/me")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/medicine-reminders/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/medicine-reminders/me/*")
                                                .hasRole("PATIENT")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/v1/medicine-reminders/me/*")
                                                .hasRole("PATIENT")

                                                // notifications

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/notifications/me")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/notifications/me/unread")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/v1/notifications/me/*/read")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/v1/notifications/me/read-all")
                                                .authenticated()

                                                // clinics

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/clinics")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/clinics")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/clinics/**")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/clinics/*")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/v1/clinics/*")
                                                .hasRole("ADMIN")

                                                // audit-logs

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/audit-logs")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/audit-logs/**")
                                                .hasRole("ADMIN")

                                                .anyRequest().authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

}