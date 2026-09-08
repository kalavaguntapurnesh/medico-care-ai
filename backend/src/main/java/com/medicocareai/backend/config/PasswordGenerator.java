package com.medicocareai.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordGenerator implements CommandLineRunner {

    @Override
    public void run(String... args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        System.out.println(
                "ADMIN PASSWORD HASH:"
        );

        System.out.println(
                encoder.encode("Doctor123!")
        );
    }
}