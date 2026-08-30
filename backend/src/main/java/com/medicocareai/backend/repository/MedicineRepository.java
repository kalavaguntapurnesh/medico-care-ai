package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicineRepository
        extends JpaRepository<Medicine, UUID> {

    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByGenericNameContainingIgnoreCase(String genericName);

    List<Medicine> findByActiveTrue();
}
