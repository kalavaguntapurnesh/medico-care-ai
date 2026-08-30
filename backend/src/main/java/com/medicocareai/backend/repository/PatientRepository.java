package com.medicocareai.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicocareai.backend.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);


}
