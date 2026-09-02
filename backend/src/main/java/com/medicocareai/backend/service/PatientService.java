package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.medicocareai.backend.dto.patient.CreatePatientRequest;
import com.medicocareai.backend.dto.patient.PatientResponse;
import com.medicocareai.backend.dto.patient.UpdatePatientRequest;
import com.medicocareai.backend.entity.Patient;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.PatientRepository;
import com.medicocareai.backend.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(
            PatientRepository patientRepository,
            UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PatientResponse createPatient(
            UUID userId,
            CreatePatientRequest request) {
        if (patientRepository.existsByUserId(userId)) {
            throw new ConflictException("Patient profile already exists for this user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user not found : " + userId));
        Patient patient = new Patient();

        patient.setUser(user);
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setHeightCm(request.getHeightCm());
        patient.setWeightKg(request.getWeightKg());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

        LocalDateTime now = LocalDateTime.now();
        patient.setCreatedAt(now);
        patient.setUpdatedAt(now);
        Patient savedPatient = patientRepository.save(patient);
        return toResponse(savedPatient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(UUID userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse updatePatient(
            UUID userId,
            UpdatePatientRequest request) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        if (request.getDateOfBirth() != null) {
            patient.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }

        if (request.getBloodGroup() != null) {
            patient.setBloodGroup(request.getBloodGroup());
        }

        if (request.getHeightCm() != null) {
            patient.setHeightCm(request.getHeightCm());
        }

        if (request.getWeightKg() != null) {
            patient.setWeightKg(request.getWeightKg());
        }

        if (request.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(
                    request.getEmergencyContactName());
        }

        if (request.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(
                    request.getEmergencyContactPhone());
        }

        patient.setUpdatedAt(LocalDateTime.now());

        Patient updatedPatient = patientRepository.save(patient);

        return toResponse(updatedPatient);

    }

    private PatientResponse toResponse(Patient patient) {
        User user = patient.getUser();

        return PatientResponse.builder()
                .id(patient.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .heightCm(patient.getHeightCm())
                .weightKg(patient.getWeightKg())
                .emergencyContactName(
                        patient.getEmergencyContactName())
                .emergencyContactPhone(
                        patient.getEmergencyContactPhone())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .build();
    }

    @Transactional
    public PatientResponse createPatientByEmail(
            String email,
            CreatePatientRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user not found : " + email));

        return createPatient(user.getId(), request);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user not found : " + email));
        return getPatientByUserId(user.getId());
    }

    @Transactional
    public PatientResponse updatePatientByEmail(
            String email,
            UpdatePatientRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user not found : " + email));
        return updatePatient(user.getId(), request);
    }
}
