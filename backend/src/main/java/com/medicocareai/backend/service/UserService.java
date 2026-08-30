package com.medicocareai.backend.service;

import java.util.List;
import java.util.UUID;

import com.medicocareai.backend.entity.Role;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.repository.RoleRepository;
import com.medicocareai.backend.repository.UserRepository;

public class UserService {
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    public UserService(
            UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found : " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found : " + email));
    }

    public User createUser(
            String email,
            String passwordHash,
            String firstName,
            String lastName,
            String phoneNumber,
            String roleName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists : " + email);
        }
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(
                        "Role not found: " + roleName));

        User user = new User();

        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        return userRepository.save(user);
    }

    public User updateUser(
        UUID id,
        String firstName,
        String lastName,
        String phoneNumber
    ){
        User user = getUserById(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

}
