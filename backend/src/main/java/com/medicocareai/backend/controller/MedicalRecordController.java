package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.medicalrecord.CreateMedicalRecordRequest;
import com.medicocareai.backend.dto.medicalrecord.MedicalRecordResponse;
import com.medicocareai.backend.dto.medicalrecord.UpdateMedicalRecordRequest;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.service.MedicalRecordService;

import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1/medical-records")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(
            MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<MedicalRecordResponse> createMedicalRecord(
            Authentication authentication,
            @Valid @ModelAttribute CreateMedicalRecordRequest request,
            @RequestParam("file") MultipartFile file) {
        UUID userId = getUserId(authentication);

        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(userId, request, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientMedicalRecord(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecords(userId));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<MedicalRecordResponse> getPatientMedicalRecord(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecord(userId, id));
    }

    @PutMapping("/me/{id}")
    public ResponseEntity<MedicalRecordResponse> updateMedicalRecord(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMedicalRecordRequest request) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(medicalRecordService.updateMedicalRecord(userId, id, request));
    }

    @DeleteMapping("/me/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = getUserId(authentication);
        medicalRecordService.deleteMedicalRecord(userId, id);
        return ResponseEntity.noContent().build();

    }

    @GetMapping("/uploaded-by-me")
    public ResponseEntity<List<MedicalRecordResponse>> getRecordsUploadedByUser(
            Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(medicalRecordService.getRecordsUploadedByUser(userId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientMedicalRecordsForDoctor(
            Authentication authentication,
            @PathVariable UUID patientId) {
        UUID doctorUserId = getUserId(authentication);
        return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecordsForDoctor(doctorUserId, patientId));
    }

    @GetMapping("/me/{id}/download")
    public ResponseEntity<Resource> downloadMyMedicalRecord(
            Authentication authentication,
            @PathVariable UUID id) {

        UUID userId = getUserId(authentication);

        // The service verifies ownership and that the record is not deleted.
        Path filePath = medicalRecordService.getPatientMedicalRecordFile(
                userId, id);

        MedicalRecordResponse record = medicalRecordService.getPatientMedicalRecord(userId, id);

        Resource resource = new FileSystemResource(filePath);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(record.getMimeType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(record.getFileName())
                .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString())
                .contentLength(record.getFileSize())
                .body(resource);
    }

    @GetMapping("/patient/{patientId}/{recordId}/download")
    public ResponseEntity<Resource> downloadPatientMedicalRecordForDoctor(
            Authentication authentication,
            @PathVariable UUID patientId,
            @PathVariable UUID recordId) {

        UUID doctorUserId = getUserId(authentication);

        MedicalRecordService.MedicalRecordDownload download = medicalRecordService.getDoctorMedicalRecordFile(
                doctorUserId,
                patientId,
                recordId);

        Resource resource = new FileSystemResource(download.filePath());

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(download.mimeType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.fileName())
                .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString())
                .contentLength(download.fileSize())
                .body(resource);
    }

    private UUID getUserId(Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        return principal.getUserId();
    }

}
