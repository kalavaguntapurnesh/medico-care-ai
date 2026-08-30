package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, UUID> {

    List<Prescription> findByPatientId(UUID patientId);

    List<Prescription> findByDoctorId(UUID doctorId);

    List<Prescription> findByAppointmentId(UUID appointmentId);
}
