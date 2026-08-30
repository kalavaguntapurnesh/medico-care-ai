package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionItemRepository
        extends JpaRepository<PrescriptionItem, UUID> {

    List<PrescriptionItem> findByPrescriptionId(UUID prescriptionId);

    List<PrescriptionItem> findByMedicineId(UUID medicineId);
}
