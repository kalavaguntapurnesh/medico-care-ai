package com.medicocareai.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.medicocareai.backend.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
