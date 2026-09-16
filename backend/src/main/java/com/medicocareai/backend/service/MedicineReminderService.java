package com.medicocareai.backend.service;

import com.medicocareai.backend.dto.medicinereminder.CreateMedicineReminderRequest;
import com.medicocareai.backend.dto.medicinereminder.MedicineReminderResponse;
import com.medicocareai.backend.dto.medicinereminder.UpdateMedicineReminderRequest;
import com.medicocareai.backend.entity.Medicine;
import com.medicocareai.backend.entity.MedicineReminder;
import com.medicocareai.backend.entity.Patient;
import com.medicocareai.backend.repository.MedicineReminderRepository;
import com.medicocareai.backend.repository.MedicineRepository;
import com.medicocareai.backend.repository.PatientRepository;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.exception.BadRequestException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MedicineReminderService {

    private final MedicineReminderRepository medicineReminderRepository;
    private final MedicineRepository medicineRepository;
    private final PatientRepository patientRepository;

    public MedicineReminderService(
            MedicineReminderRepository medicineReminderRepository,
            MedicineRepository medicineRepository,
            PatientRepository patientRepository) {

        this.medicineReminderRepository = medicineReminderRepository;
        this.medicineRepository = medicineRepository;
        this.patientRepository = patientRepository;
    }

    public MedicineReminderResponse createReminder(
            CustomUserPrincipal principal,
            CreateMedicineReminderRequest request) {

        UUID userId = principal.getUserId();

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medicine not found"));

        if (!medicine.isActive()) {
            throw new BadRequestException(
                    "Cannot create reminder for an inactive medicine");
        }

        validateDates(
                request.getStartDate(),
                request.getEndDate());

        LocalDateTime now = LocalDateTime.now();

        MedicineReminder reminder = new MedicineReminder();

        reminder.setPatient(patient);
        reminder.setMedicine(medicine);
        reminder.setDosage(request.getDosage());
        reminder.setFrequency(request.getFrequency());
        reminder.setStartDate(request.getStartDate());
        reminder.setEndDate(request.getEndDate());
        reminder.setReminderTime(request.getReminderTime());
        reminder.setActive(true);
        reminder.setCreatedAt(now);
        reminder.setUpdatedAt(now);

        MedicineReminder saved = medicineReminderRepository.save(reminder);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicineReminderResponse> getMyReminders(
            CustomUserPrincipal principal) {

        UUID userId = principal.getUserId();

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        return medicineReminderRepository
                .findByPatientIdAndActiveTrue(patient.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicineReminderResponse getMyReminder(
            CustomUserPrincipal principal,
            UUID reminderId) {

        UUID userId = principal.getUserId();

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        MedicineReminder reminder = medicineReminderRepository
                .findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medicine reminder not found"));

        /*
         * Ownership check.
         *
         * We intentionally return "not found" when the reminder
         * belongs to another patient.
         */
        if (!reminder.getPatient().getId().equals(patient.getId())) {
            throw new ResourceNotFoundException(
                    "Medicine reminder not found");
        }

        if (!reminder.isActive()) {
            throw new ResourceNotFoundException(
                    "Medicine reminder not found");
        }

        return mapToResponse(reminder);
    }

    public MedicineReminderResponse updateReminder(
            CustomUserPrincipal principal,
            UUID reminderId,
            UpdateMedicineReminderRequest request) {

        UUID userId = principal.getUserId();

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        MedicineReminder reminder = medicineReminderRepository
                .findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medicine reminder not found"));

        if (!reminder.getPatient().getId().equals(patient.getId())) {
            throw new ResourceNotFoundException(
                    "Medicine reminder not found");
        }

        if (!reminder.isActive()) {
            throw new ResourceNotFoundException(
                    "Medicine reminder not found");
        }

        /*
         * Medicine update
         */
        if (request.getMedicineId() != null) {

            Medicine medicine = medicineRepository.findById(request.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Medicine not found"));

            if (!medicine.isActive()) {
                throw new BadRequestException(
                        "Cannot use an inactive medicine");
            }

            reminder.setMedicine(medicine);
        }

        /*
         * Update only supplied fields.
         */
        if (request.getDosage() != null) {
            reminder.setDosage(request.getDosage());
        }

        if (request.getFrequency() != null) {
            reminder.setFrequency(request.getFrequency());
        }

        if (request.getStartDate() != null) {
            reminder.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            reminder.setEndDate(request.getEndDate());
        }

        if (request.getReminderTime() != null) {
            reminder.setReminderTime(request.getReminderTime());
        }

        if (request.getActive() != null) {
            reminder.setActive(request.getActive());
        }

        /*
         * Validate the final resulting date range.
         */
        validateDates(
                reminder.getStartDate(),
                reminder.getEndDate());

        reminder.setUpdatedAt(LocalDateTime.now());

        MedicineReminder saved = medicineReminderRepository.save(reminder);

        return mapToResponse(saved);
    }

    public void deactivateReminder(
            CustomUserPrincipal principal,
            UUID reminderId) {

        UUID userId = principal.getUserId();

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        MedicineReminder reminder = medicineReminderRepository
                .findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medicine reminder not found"));

        if (!reminder.getPatient().getId().equals(patient.getId())) {
            throw new ResourceNotFoundException(
                    "Medicine reminder not found");
        }

        if (!reminder.isActive()) {
            return;
        }

        reminder.setActive(false);
        reminder.setUpdatedAt(LocalDateTime.now());

        medicineReminderRepository.save(reminder);
    }

    private void validateDates(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null) {
            throw new BadRequestException(
                    "Start date is required");
        }

        if (endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException(
                    "End date cannot be before start date");
        }
    }

    private MedicineReminderResponse mapToResponse(
            MedicineReminder reminder) {

        Medicine medicine = reminder.getMedicine();

        return MedicineReminderResponse.builder()
                .id(reminder.getId())
                .patientId(reminder.getPatient().getId())
                .medicineId(medicine.getId())
                .medicineName(medicine.getName())
                .genericName(medicine.getGenericName())
                .strength(medicine.getStrength())
                .form(medicine.getForm())
                .dosage(reminder.getDosage())
                .frequency(reminder.getFrequency())
                .startDate(reminder.getStartDate())
                .endDate(reminder.getEndDate())
                .reminderTime(reminder.getReminderTime())
                .active(reminder.isActive())
                .createdAt(reminder.getCreatedAt())
                .updatedAt(reminder.getUpdatedAt())
                .build();
    }
}