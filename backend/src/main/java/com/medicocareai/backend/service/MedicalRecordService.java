package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

import java.nio.file.Path;

import org.springframework.stereotype.Service;

import com.medicocareai.backend.dto.medicalrecord.CreateMedicalRecordRequest;
import com.medicocareai.backend.dto.medicalrecord.MedicalRecordResponse;
import com.medicocareai.backend.dto.medicalrecord.UpdateMedicalRecordRequest;
import com.medicocareai.backend.entity.Doctor;
import com.medicocareai.backend.entity.MedicalRecord;
import com.medicocareai.backend.entity.Patient;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.AppointmentRepository;
import com.medicocareai.backend.repository.DoctorRepository;
import com.medicocareai.backend.repository.MedicalRecordRepository;
import com.medicocareai.backend.repository.PatientRepository;
import com.medicocareai.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MedicalRecordService {
        private final MedicalRecordRepository medicalRecordRepository;
        private final PatientRepository patientRepository;
        private final DoctorRepository doctorRepository;
        private final AppointmentRepository appointmentRepository;
        private final UserRepository userRepository;

        private final MedicalRecordStorageService medicalRecordStorageService;

        public MedicalRecordService(
                        MedicalRecordRepository medicalRecordRepository,
                        PatientRepository patientRepository,
                        UserRepository userRepository,
                        DoctorRepository doctorRepository,
                        AppointmentRepository appointmentRepository,
                        MedicalRecordStorageService medicalRecordStorageService) {
                this.medicalRecordRepository = medicalRecordRepository;
                this.patientRepository = patientRepository;
                this.userRepository = userRepository;
                this.doctorRepository = doctorRepository;
                this.appointmentRepository = appointmentRepository;
                this.medicalRecordStorageService = medicalRecordStorageService;
        }

        // creating a medical record for the authenticated patient

        public MedicalRecordResponse createMedicalRecord(
                        UUID patientUserId,
                        CreateMedicalRecordRequest request,
                        MultipartFile file) {

                Patient patient = patientRepository.findByUserId(patientUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

                User uploadedBy = userRepository.findById(patientUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                MedicalRecordStorageService.StoredMedicalFile storedFile;

                try {
                        storedFile = medicalRecordStorageService.store(file);
                } catch (IOException ex) {
                        throw new IllegalStateException(
                                        "Failed to store the medical record file", ex);
                }

                MedicalRecord medicalRecord = new MedicalRecord();

                medicalRecord.setPatient(patient);
                medicalRecord.setUploadedBy(uploadedBy);
                medicalRecord.setRecordType(request.getRecordType());
                medicalRecord.setTitle(request.getTitle());
                medicalRecord.setDescription(request.getDescription());

                // Use server-verified file metadata.
                medicalRecord.setFileName(storedFile.originalFilename());
                medicalRecord.setFilePath(storedFile.storageFilename());
                medicalRecord.setMimeType(storedFile.mimeType());
                medicalRecord.setFileSize(storedFile.fileSize());

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

                return medicalRecordRepository.findByPatientIdAndDeletedAtIsNull(patient.getId()).stream()
                                .map(this::toResponse)
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

        // getting medical records to doctor only their treated patients
        @Transactional(readOnly = true)
        public List<MedicalRecordResponse> getPatientMedicalRecordsForDoctor(
                        UUID doctorUserId,
                        UUID patientId) {

                Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Doctor profile not found"));

                Patient patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Patient profile not found"));

                boolean hasAppointment = appointmentRepository.existsByDoctorIdAndPatientId(
                                doctor.getId(),
                                patient.getId());

                if (!hasAppointment) {
                        throw new ResourceNotFoundException(
                                        "Patient not found");
                }

                return medicalRecordRepository
                                .findByPatientIdAndDeletedAtIsNull(patient.getId())
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public Path getPatientMedicalRecordFile(
                        UUID patientUserId,
                        UUID medicalRecordId) {
                Patient patient = patientRepository.findByUserId(patientUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

                MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

                // do not expose deleted records

                if (medicalRecord.getDeletedAt() != null) {
                        throw new ResourceNotFoundException("Medical record not found");
                }

                // a patient can download only their own records

                if (!medicalRecord.getPatient().getId().equals(patient.getId())) {
                        throw new ResourceNotFoundException("Medical record not found");
                }

                try {
                        return medicalRecordStorageService.getExistingFile(medicalRecord.getFilePath());
                } catch (IOException e) {
                        throw new ResourceNotFoundException("Medical record file not found");
                }
        }

        public record MedicalRecordDownload(
                        Path filePath,
                        String fileName,
                        String mimeType,
                        long fileSize) {
        }

        @Transactional(readOnly = true)
        public MedicalRecordDownload getDoctorMedicalRecordFile(
                        UUID doctorUserId,
                        UUID patientId,
                        UUID medicalRecordId) {

                Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

                Patient patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

                // Verify that this doctor has an appointment relationship with the patient.
                boolean hasAppointment = appointmentRepository
                                .existsByDoctorIdAndPatientId(doctor.getId(), patient.getId());

                if (!hasAppointment) {
                        throw new ResourceNotFoundException("Patient not found");
                }

                MedicalRecord medicalRecord = medicalRecordRepository
                                .findById(medicalRecordId)
                                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

                // Do not expose deleted records or records belonging to another patient.
                if (medicalRecord.getDeletedAt() != null
                                || !medicalRecord.getPatient().getId().equals(patient.getId())) {
                        throw new ResourceNotFoundException("Medical record not found");
                }

                try {
                        Path filePath = medicalRecordStorageService.getExistingFile(
                                        medicalRecord.getFilePath());

                        return new MedicalRecordDownload(
                                        filePath,
                                        medicalRecord.getFileName(),
                                        medicalRecord.getMimeType(),
                                        medicalRecord.getFileSize());

                } catch (IOException ex) {
                        throw new ResourceNotFoundException("Medical record file not found");
                }
        }

}
