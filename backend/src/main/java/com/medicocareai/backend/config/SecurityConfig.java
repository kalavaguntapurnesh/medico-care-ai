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

                                                .anyRequest().authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

}