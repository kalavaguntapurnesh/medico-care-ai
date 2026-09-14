package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.prescription.CreatePrescriptionRequest;
import com.medicocareai.backend.dto.prescription.PrescriptionItemRequest;
import com.medicocareai.backend.dto.prescription.PrescriptionItemResponse;
import com.medicocareai.backend.dto.prescription.PrescriptionResponse;
import com.medicocareai.backend.entity.Appointment;
import com.medicocareai.backend.entity.Doctor;
import com.medicocareai.backend.entity.Medicine;
import com.medicocareai.backend.entity.Patient;
import com.medicocareai.backend.entity.Prescription;
import com.medicocareai.backend.entity.PrescriptionItem;
import com.medicocareai.backend.enums.PrescriptionStatus;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.AppointmentRepository;
import com.medicocareai.backend.repository.DoctorRepository;
import com.medicocareai.backend.repository.MedicineRepository;
import com.medicocareai.backend.repository.PatientRepository;
import com.medicocareai.backend.repository.PrescriptionItemRepository;
import com.medicocareai.backend.repository.PrescriptionRepository;

@Service
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicineRepository medicineRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            MedicineRepository medicineRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicineRepository = medicineRepository;
    }

    /**
     * Doctor creates a prescription for a patient
     * associated with an appointment.
     */
    public PrescriptionResponse createPrescription(
            UUID doctorUserId,
            CreatePrescriptionRequest request) {

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found"));

        Appointment appointment = appointmentRepository
                .findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        /*
         * Verify that this appointment belongs to both
         * the authenticated doctor and requested patient.
         */
        if (!appointment.getDoctor()
                .getId()
                .equals(doctor.getId())) {

            throw new ResourceNotFoundException(
                    "Appointment not found");
        }

        if (!appointment.getPatient()
                .getId()
                .equals(patient.getId())) {

            throw new ResourceNotFoundException(
                    "Appointment not found");
        }

        /*
         * A prescription should only be created for an
         * appointment that has actually taken place.
         */
        if (!"COMPLETED".equals(appointment.getStatus())) {

            throw new ConflictException(
                    "Prescription can only be created for a completed appointment");
        }

        /*
         * Prevent duplicate prescriptions for the same appointment.
         */
        if (!prescriptionRepository
                .findByAppointmentId(appointment.getId())
                .isEmpty()) {

            throw new ConflictException(
                    "A prescription already exists for this appointment");
        }

        /*
         * Validate all medicines before creating anything.
         */
        List<Medicine> medicines = new ArrayList<>();

        for (PrescriptionItemRequest itemRequest : request.getItems()) {

            Medicine medicine = medicineRepository
                    .findById(itemRequest.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Medicine not found: "
                                    + itemRequest.getMedicineId()));

            if (!medicine.isActive()) {
                throw new ConflictException(
                        "Medicine is inactive: " + medicine.getName());
            }

            medicines.add(medicine);
        }

        /*
         * Create prescription.
         */
        Prescription prescription = new Prescription();

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setAppointment(appointment);
        prescription.setPrescriptionDate(
                request.getPrescriptionDate());
        prescription.setNotes(request.getNotes());
        prescription.setStatus(
                PrescriptionStatus.ACTIVE.name());

        LocalDateTime now = LocalDateTime.now();

        prescription.setCreatedAt(now);
        prescription.setUpdatedAt(now);

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        /*
         * Create prescription items.
         */
        List<PrescriptionItem> items = new ArrayList<>();

        for (int i = 0; i < request.getItems().size(); i++) {

            PrescriptionItemRequest itemRequest = request.getItems().get(i);

            Medicine medicine = medicines.get(i);

            PrescriptionItem item = new PrescriptionItem();

            item.setPrescription(savedPrescription);
            item.setMedicine(medicine);
            item.setDosage(itemRequest.getDosage());
            item.setFrequency(itemRequest.getFrequency());
            item.setDurationDays(itemRequest.getDurationDays());
            item.setInstructions(itemRequest.getInstructions());

            items.add(item);
        }

        prescriptionItemRepository.saveAll(items);

        return toResponse(
                savedPrescription,
                items);
    }

    /**
     * Get all prescriptions belonging to the authenticated patient.
     */
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPatientPrescriptions(
            UUID patientUserId) {

        Patient patient = patientRepository
                .findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        return prescriptionRepository
                .findByPatientId(patient.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get one prescription belonging to the authenticated patient.
     */
    @Transactional(readOnly = true)
    public PrescriptionResponse getPatientPrescription(
            UUID patientUserId,
            UUID prescriptionId) {

        Patient patient = patientRepository
                .findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        Prescription prescription = prescriptionRepository
                .findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Prescription not found"));

        if (!prescription.getPatient()
                .getId()
                .equals(patient.getId())) {

            throw new ResourceNotFoundException(
                    "Prescription not found");
        }

        return toResponse(prescription);
    }

    /**
     * Get prescriptions created by the authenticated doctor.
     */
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getDoctorPrescriptions(
            UUID doctorUserId) {

        Doctor doctor = doctorRepository
                .findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        return prescriptionRepository
                .findByDoctorId(doctor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get one prescription created by the authenticated doctor.
     */
    @Transactional(readOnly = true)
    public PrescriptionResponse getDoctorPrescription(
            UUID doctorUserId,
            UUID prescriptionId) {

        Doctor doctor = doctorRepository
                .findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found"));

        Prescription prescription = prescriptionRepository
                .findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Prescription not found"));

        if (!prescription.getDoctor()
                .getId()
                .equals(doctor.getId())) {

            throw new ResourceNotFoundException(
                    "Prescription not found");
        }

        return toResponse(prescription);
    }

    private PrescriptionResponse toResponse(
            Prescription prescription) {

        List<PrescriptionItem> items = prescriptionItemRepository
                .findByPrescriptionId(
                        prescription.getId());

        return toResponse(
                prescription,
                items);
    }

    private PrescriptionResponse toResponse(
            Prescription prescription,
            List<PrescriptionItem> items) {

        List<PrescriptionItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .patientId(
                        prescription.getPatient().getId())
                .doctorId(
                        prescription.getDoctor().getId())
                .appointmentId(
                        prescription.getAppointment().getId())
                .prescriptionDate(
                        prescription.getPrescriptionDate())
                .notes(
                        prescription.getNotes())
                .status(
                        prescription.getStatus())
                .createdAt(
                        prescription.getCreatedAt())
                .updatedAt(
                        prescription.getUpdatedAt())
                .items(itemResponses)
                .build();
    }

    private PrescriptionItemResponse toItemResponse(
            PrescriptionItem item) {

        Medicine medicine = item.getMedicine();

        return PrescriptionItemResponse.builder()
                .id(item.getId())
                .medicineId(medicine.getId())
                .medicineName(medicine.getName())
                .genericName(medicine.getGenericName())
                .strength(medicine.getStrength())
                .form(medicine.getForm())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .durationDays(item.getDurationDays())
                .instructions(item.getInstructions())
                .build();
    }
}