package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.medicocareai.backend.dto.medicalrecord.CreateMedicalRecordRequest;
import com.medicocareai.backend.dto.medicalrecord.MedicalRecordResponse;
import com.medicocareai.backend.dto.medicalrecord.UpdateMedicalRecordRequest;
import com.medicocareai.backend.entity.MedicalRecord;
import com.medicocareai.backend.entity.Patient;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.MedicalRecordRepository;
import com.medicocareai.backend.repository.PatientRepository;
import com.medicocareai.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    private final UserRepository userRepository;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // creating a medical record for the authenticated patient
    public MedicalRecordResponse createMedicalRecord(
            UUID patientUserId,
            CreateMedicalRecordRequest request) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        User uploadedBy = userRepository.findById(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MedicalRecord medicalRecord = new MedicalRecord();

        medicalRecord.setPatient(patient);
        medicalRecord.setUploadedBy(uploadedBy);
        medicalRecord.setRecordType(request.getRecordType());
        medicalRecord.setTitle(request.getTitle());
        medicalRecord.setDescription(request.getDescription());
        medicalRecord.setFileName(request.getFileName());
        medicalRecord.setFilePath(request.getFilePath());
        medicalRecord.setMimeType(request.getMimeType());
        medicalRecord.setFileSize(request.getFileSize());
        medicalRecord.setRecordDate(request.getRecordDate());

        LocalDateTime now = LocalDateTime.now();

        medicalRecord.setCreatedAt(now);
        medicalRecord.setUpdatedAt(now);
        medicalRecord.setDeletedAt(null);

        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
        return toResponse(savedRecord);
    }

    // get all the active medical records belonging to the authenticated patient
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientMedicalRecords(
            UUID patientUserId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return medicalRecordRepository.findByPatientIdAndDeletedAtIsNull(patient.getId()).stream().map(this::toResponse)
                .toList();
    }

    // get a specific active medical record of the authenticated patient
    @Transactional(readOnly = true)
    public MedicalRecordResponse getPatientMedicalRecord(
            UUID patientUserId,
            UUID medicalRecordId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (medicalRecord.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Medical record not found");
        }

        if (!medicalRecord.getPatient().getId().equals(patient.getId())) {
            throw new ResourceNotFoundException("Medical record not found");
        }

        return toResponse(medicalRecord);
    }

    // update an active medical record of an authenticated patient
    public MedicalRecordResponse updateMedicalRecord(
            UUID patientUserId,
            UUID medicalRecordId,
            UpdateMedicalRecordRequest request) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (medicalRecord.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Medical record not found");
        }

        if (!medicalRecord.getPatient().getId().equals(patient.getId())) {
            throw new ResourceNotFoundException("Medical record not found");
        }

        if (request.getRecordType() != null) {
            medicalRecord.setRecordType(request.getRecordType());
        }

        if (request.getTitle() != null) {
            medicalRecord.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            medicalRecord.setDescription(request.getDescription());
        }

        if (request.getFileName() != null) {
            medicalRecord.setFileName(request.getFileName());
        }

        if (request.getFilePath() != null) {
            medicalRecord.setFilePath(request.getFilePath());
        }

        if (request.getMimeType() != null) {
            medicalRecord.setMimeType(
                    request.getMimeType());
        }

        if (request.getFileSize() != null) {
            medicalRecord.setFileSize(
                    request.getFileSize());
        }

        if (request.getRecordDate() != null) {
            medicalRecord.setRecordDate(
                    request.getRecordDate());
        }

        medicalRecord.setUpdatedAt(LocalDateTime.now());

        MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);

        return toResponse(updatedRecord);

    }

    public void deleteMedicalRecord(
            UUID patientUserId,
            UUID medicalRecordId) {

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medical record not found"));

        if (medicalRecord.getDeletedAt() != null) {
            throw new ConflictException(
                    "Medical record is already deleted");
        }

        if (!medicalRecord.getPatient()
                .getId()
                .equals(patient.getId())) {

            throw new ResourceNotFoundException(
                    "Medical record not found");
        }

        LocalDateTime now = LocalDateTime.now();

        medicalRecord.setDeletedAt(now);
        medicalRecord.setUpdatedAt(now);

        medicalRecordRepository.save(medicalRecord);
    }

    /**
     * Get records uploaded by the authenticated user.
     */
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getRecordsUploadedByUser(
            UUID userId) {

        return medicalRecordRepository
                .findByUploadedById(userId)
                .stream()
                .filter(record -> record.getDeletedAt() == null)
                .map(this::toResponse)
                .toList();
    }

    private MedicalRecordResponse toResponse(
            MedicalRecord medicalRecord) {
        Patient patient = medicalRecord.getPatient();
        User uploadedBy = medicalRecord.getUploadedBy();

        return MedicalRecordResponse.builder()
                .id(medicalRecord.getId())
                .patientId(patient.getId())
                .uploadedBy(uploadedBy.getId())
                .uploadedByEmail(uploadedBy.getEmail())
                .recordType(medicalRecord.getRecordType())
                .title(medicalRecord.getTitle())
                .description(medicalRecord.getDescription())
                .fileName(medicalRecord.getFileName())
                .filePath(medicalRecord.getFilePath())
                .mimeType(medicalRecord.getMimeType())
                .fileSize(medicalRecord.getFileSize())
                .recordDate(medicalRecord.getRecordDate())
                .createdAt(medicalRecord.getCreatedAt())
                .updatedAt(medicalRecord.getUpdatedAt())
                .deletedAt(medicalRecord.getDeletedAt())
                .build();
    }
}
