package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.medicocareai.backend.dto.doctor.CreateDoctorRequest;
import com.medicocareai.backend.dto.doctor.DoctorResponse;
import com.medicocareai.backend.dto.doctor.UpdateDoctorApprovalRequest;
import com.medicocareai.backend.dto.doctor.UpdateDoctorRequest;
import com.medicocareai.backend.entity.Doctor;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.enums.DoctorApprovalStatus;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.DoctorRepository;
import com.medicocareai.backend.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public DoctorResponse createDoctor(
            CreateDoctorRequest request) {
        if (doctorRepository.existsByUserId(request.getUserId())) {
            throw new ConflictException("Doctor profile already exists for this user");
        }

        if (request.getLicenseNumber() != null && doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new ConflictException("License Number already exists");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found: " + request.getUserId()));

        if (user.getRole() == null || !"DOCTOR".equals(user.getRole().getName())) {
            throw new ConflictException("User must have DOCTOR role");

        }

        Doctor doctor = new Doctor();

        doctor.setUser(user);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setLicenseNumber(request.getLicenseNumber());

        // doctors required "ADMIN" approval

        doctor.setApprovalStatus("PENDING");
        doctor.setBio(request.getBio());
        LocalDateTime now = LocalDateTime.now();

        doctor.setCreatedAt(now);
        doctor.setUpdatedAt(now);

        Doctor savedDoctor = doctorRepository.save(doctor);
        return toResponse(savedDoctor);

    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return toResponse(doctor);
    }

    @Transactional
    public DoctorResponse updateDoctor(
            UUID userId,
            UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        if (request.getSpecialization() != null) {
            doctor.setSpecialization(request.getSpecialization());

        }
        if (request.getQualification() != null) {
            doctor.setQualification(request.getQualification());
        }
        if (request.getExperienceYears() != null) {
            doctor.setExperienceYears(request.getExperienceYears());
        }

        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }

        if (request.getLicenseNumber() != null) {
            if (!request.getLicenseNumber().equals(doctor.getLicenseNumber())
                    && doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new ConflictException("License number already exists");
            }

            doctor.setLicenseNumber(request.getLicenseNumber());
        }

        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }

        doctor.setUpdatedAt(LocalDateTime.now());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return toResponse(updatedDoctor);
    }

    private DoctorResponse toResponse(Doctor doctor) {
        User user = doctor.getUser();

        return DoctorResponse.builder()
                .id(doctor.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .licenseNumber(doctor.getLicenseNumber())
                .approvalStatus(doctor.getApprovalStatus())
                .bio(doctor.getBio())
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found : " + email));
        UUID userId = user.getId();

        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found : " + userId));

        return toResponse(doctor);
    }

    @Transactional
    public DoctorResponse updateDoctorByEmail(String email, UpdateDoctorRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user not found : " + email));
        return updateDoctor(user.getId(), request);
    }

    @Transactional
    public DoctorResponse updateDoctorApproval(
            UUID doctorId,
            UpdateDoctorApprovalRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        if (request.getApprovalStatus() == DoctorApprovalStatus.PENDING) {
            throw new ConflictException("Doctor approval status cannot be changed to PENDING");
        }

        doctor.setApprovalStatus(request.getApprovalStatus().name());

        doctor.setUpdatedAt(LocalDateTime.now());

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return toResponse(updatedDoctor);
    }

    @Transactional(readOnly = true)
    public Doctor getApprovedDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found : " + email));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found "));

        if (!DoctorApprovalStatus.APPROVED.name().equals(doctor.getApprovalStatus())) {
            throw new ConflictException("Doctor account is not approved");
        }
        return doctor;
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getApprovedDoctors() {
        List<Doctor> doctors = doctorRepository.findByApprovalStatus(DoctorApprovalStatus.APPROVED.name());

        return doctors.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream().map(this::toResponse).toList();
    }

}
