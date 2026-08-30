package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByDoctorId(UUID doctorId);

    List<Appointment> findByPatientIdAndAppointmentDate(
            UUID patientId,
            LocalDate appointmentDate
    );

    List<Appointment> findByDoctorIdAndAppointmentDate(
            UUID doctorId,
            LocalDate appointmentDate
    );

    List<Appointment> findByDoctorIdAndStatus(
            UUID doctorId,
            String status
    );
}
