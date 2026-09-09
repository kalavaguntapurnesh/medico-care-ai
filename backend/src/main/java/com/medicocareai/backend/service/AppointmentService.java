package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.appointment.AppointmentResponse;
import com.medicocareai.backend.dto.appointment.CreateAppointmentRequest;
import com.medicocareai.backend.dto.appointment.UpdateAppointmentStatusRequest;
import com.medicocareai.backend.entity.Appointment;
import com.medicocareai.backend.entity.Doctor;
import com.medicocareai.backend.entity.Patient;
import com.medicocareai.backend.enums.AppointmentStatus;
import com.medicocareai.backend.enums.DoctorApprovalStatus;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.AppointmentRepository;
import com.medicocareai.backend.repository.DoctorRepository;
import com.medicocareai.backend.repository.PatientRepository;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public AppointmentResponse createAppointment(
            UUID patientUserId,
            CreateAppointmentRequest request) {

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        if (!DoctorApprovalStatus.APPROVED.name()
                .equals(doctor.getApprovalStatus())) {

            throw new ConflictException(
                    "Doctor is not approved for appointments");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ConflictException(
                    "Start time must be before end time");
        }

        boolean overlappingAppointment = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        doctor.getId(),
                        request.getAppointmentDate(),
                        request.getEndTime(),
                        request.getStartTime());

        if (overlappingAppointment) {
            throw new ConflictException(
                    "Doctor already has an appointment during this time");
        }

        Appointment appointment = new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus(AppointmentStatus.PENDING.name());
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());

        LocalDateTime now = LocalDateTime.now();

        appointment.setCreatedAt(now);
        appointment.setUpdatedAt(now);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return toResponse(savedAppointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(
            UUID patientUserId) {

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        return appointmentRepository
                .findByPatientId(patient.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(
            UUID doctorUserId) {

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        return appointmentRepository
                .findByDoctorId(doctor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getPatientAppointment(
            UUID patientUserId,
            UUID appointmentId) {

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        Appointment appointment = appointmentRepository
                .findByIdAndPatientId(
                        appointmentId,
                        patient.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getDoctorAppointment(
            UUID doctorUserId,
            UUID appointmentId) {

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        Appointment appointment = appointmentRepository
                .findByIdAndDoctorId(
                        appointmentId,
                        doctor.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(
            UUID doctorUserId,
            UUID appointmentId,
            UpdateAppointmentStatusRequest request) {

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        Appointment appointment = appointmentRepository
                .findByIdAndDoctorId(
                        appointmentId,
                        doctor.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        AppointmentStatus requestedStatus = request.getStatus();

        if (requestedStatus == AppointmentStatus.PENDING) {
            throw new ConflictException(
                    "Doctor cannot change appointment status to PENDING");
        }

        AppointmentStatus currentStatus = AppointmentStatus.valueOf(
                appointment.getStatus());

        validateDoctorStatusTransition(
                currentStatus,
                requestedStatus);

        appointment.setStatus(
                requestedStatus.name());

        appointment.setUpdatedAt(
                LocalDateTime.now());

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        return toResponse(updatedAppointment);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(
            UUID patientUserId,
            UUID appointmentId) {

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        Appointment appointment = appointmentRepository
                .findByIdAndPatientId(
                        appointmentId,
                        patient.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        AppointmentStatus currentStatus = AppointmentStatus.valueOf(
                appointment.getStatus());

        if (currentStatus == AppointmentStatus.COMPLETED) {
            throw new ConflictException(
                    "Completed appointment cannot be cancelled");
        }

        if (currentStatus == AppointmentStatus.CANCELLED) {
            throw new ConflictException(
                    "Appointment is already cancelled");
        }

        appointment.setStatus(
                AppointmentStatus.CANCELLED.name());

        appointment.setUpdatedAt(
                LocalDateTime.now());

        Appointment cancelledAppointment = appointmentRepository.save(appointment);

        return toResponse(cancelledAppointment);
    }

    private void validateDoctorStatusTransition(
            AppointmentStatus currentStatus,
            AppointmentStatus requestedStatus) {

        if (currentStatus == AppointmentStatus.CANCELLED) {
            throw new ConflictException(
                    "Cancelled appointment cannot be modified");
        }

        if (currentStatus == AppointmentStatus.COMPLETED) {
            throw new ConflictException(
                    "Completed appointment cannot be modified");
        }

        if (currentStatus == AppointmentStatus.PENDING) {

            if (requestedStatus != AppointmentStatus.CONFIRMED
                    && requestedStatus != AppointmentStatus.REJECTED) {

                throw new ConflictException(
                        "Pending appointment can only be confirmed or rejected");
            }

            return;
        }

        if (currentStatus == AppointmentStatus.CONFIRMED) {

            if (requestedStatus != AppointmentStatus.COMPLETED
                    && requestedStatus != AppointmentStatus.CANCELLED) {

                throw new ConflictException(
                        "Confirmed appointment can only be completed or cancelled");
            }
        }
    }

    private AppointmentResponse toResponse(
            Appointment appointment) {

        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        return AppointmentResponse.builder()
                .id(appointment.getId())

                .patientId(patient.getId())
                .doctorId(doctor.getId())

                .patientEmail(
                        patient.getUser().getEmail())
                .patientFirstName(
                        patient.getUser().getFirstName())
                .patientLastName(
                        patient.getUser().getLastName())

                .doctorEmail(
                        doctor.getUser().getEmail())
                .doctorFirstName(
                        doctor.getUser().getFirstName())
                .doctorLastName(
                        doctor.getUser().getLastName())
                .doctorSpecialization(
                        doctor.getSpecialization())

                .appointmentDate(
                        appointment.getAppointmentDate())

                .startTime(
                        appointment.getStartTime())
                .endTime(
                        appointment.getEndTime())

                .status(
                        appointment.getStatus())

                .reason(
                        appointment.getReason())
                .notes(
                        appointment.getNotes())

                .createdAt(
                        appointment.getCreatedAt())
                .updatedAt(
                        appointment.getUpdatedAt())

                .build();
    }
}