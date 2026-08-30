package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.MedicineReminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicineReminderRepository
        extends JpaRepository<MedicineReminder, UUID> {

    List<MedicineReminder> findByPatientId(UUID patientId);

    List<MedicineReminder> findByPatientIdAndActiveTrue(UUID patientId);

    List<MedicineReminder> findByMedicineId(UUID medicineId);
}