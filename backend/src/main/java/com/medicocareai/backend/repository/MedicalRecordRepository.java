package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
public interface MedicalRecordRepository
        extends JpaRepository<MedicalRecord, UUID> {

    List<MedicalRecord> findByPatientIdAndDeletedAtIsNull(
            UUID patientId
    );

    List<MedicalRecord> findByPatientId(UUID patientId);

    List<MedicalRecord> findByUploadedById(UUID userId);
}
