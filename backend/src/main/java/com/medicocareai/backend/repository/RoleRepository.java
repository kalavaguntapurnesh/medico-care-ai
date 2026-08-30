package com.medicocareai.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicocareai.backend.entity.Role;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    
    Optional<Role> findByName(String name);
    boolean existsByName(String name);
}


//this gives us save(), findByID(), findAll(), existsById(), deleteById() automatically through "JpaRepository"