package com.medicocareai.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicocareai.backend.entity.Clinic;

public interface ClinicRepository extends JpaRepository<Clinic, UUID> {
 
    List<Clinic> findByCityIgnoreCase(String city);

    List<Clinic> findByActiveTrue();
}
