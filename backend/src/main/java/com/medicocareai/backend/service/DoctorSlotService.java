package com.medicocareai.backend.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.doctor.AvailableSlotResponse;
import com.medicocareai.backend.entity.Appointment;
import com.medicocareai.backend.entity.Doctor;
import com.medicocareai.backend.entity.DoctorAvailability;
import com.medicocareai.backend.enums.DoctorApprovalStatus;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.AppointmentRepository;
import com.medicocareai.backend.repository.DoctorAvailabilityRepository;
import com.medicocareai.backend.repository.DoctorRepository;

@Service
public class DoctorSlotService {

    private static final int SLOT_DURATION_MINUTES = 30;

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorSlotService(
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository doctorAvailabilityRepository,
            AppointmentRepository appointmentRepository) {

        this.doctorRepository = doctorRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public List<AvailableSlotResponse> getAvailableSlots(
            UUID doctorId,
            LocalDate date) {

        // 1. Find doctor
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor not found"));

        // 2. Only approved doctors can have bookable slots
        if (!DoctorApprovalStatus.APPROVED.name()
                .equals(doctor.getApprovalStatus())) {

            throw new ResourceNotFoundException(
                    "Doctor not found");
        }

        // 3. Convert Java DayOfWeek to application's 0-6 convention
        //
        // Application:
        // Monday = 1
        // Tuesday = 2
        // Wednesday = 3
        // Thursday = 4
        // Friday = 5
        // Saturday = 6
        // Sunday = 0
        short dayOfWeek = (short) (date.getDayOfWeek() == DayOfWeek.SUNDAY
                ? 0
                : date.getDayOfWeek().getValue());

        // 4. Get doctor's active weekly availability
        List<DoctorAvailability> availabilities = doctorAvailabilityRepository
                .findByDoctorIdAndDayOfWeekAndActiveTrue(
                        doctorId,
                        dayOfWeek);

        // Doctor does not work on this day
        if (availabilities.isEmpty()) {
            return List.of();
        }

        // 5. Get appointments for this doctor on requested date
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentDate(
                        doctorId,
                        date);

        List<AvailableSlotResponse> availableSlots = new ArrayList<>();

        // 6. Generate 30-minute slots
        for (DoctorAvailability availability : availabilities) {

            LocalTime slotStart = availability.getStartTime();

            while (!slotStart.isAfter(
                    availability.getEndTime()
                            .minusMinutes(SLOT_DURATION_MINUTES))) {

                LocalTime slotEnd = slotStart.plusMinutes(SLOT_DURATION_MINUTES);

                // 7. Check whether slot conflicts with an appointment
                boolean occupied = isSlotOccupied(
                        appointments,
                        slotStart,
                        slotEnd);

                // 8. Only return free slots
                if (!occupied) {
                    availableSlots.add(
                            AvailableSlotResponse.builder()
                                    .startTime(slotStart)
                                    .endTime(slotEnd)
                                    .build());
                }

                slotStart = slotEnd;
            }
        }

        // 9. Return slots ordered by start time
        return availableSlots.stream()
                .sorted(
                        Comparator.comparing(
                                AvailableSlotResponse::getStartTime))
                .toList();
    }

    /**
     * Appointments that occupy the doctor's calendar.
     *
     * CANCELLED and REJECTED appointments do not block slots.
     */
    private boolean isBlockingAppointment(
            Appointment appointment) {

        return !"CANCELLED".equals(appointment.getStatus())
                && !"REJECTED".equals(appointment.getStatus());
    }

    /**
     * Determines whether two time ranges overlap.
     *
     * Example:
     *
     * Slot: 10:00 - 10:30
     * Appointment: 10:15 - 10:45
     *
     * Result: true
     *
     * Slot: 10:00 - 10:30
     * Appointment: 10:30 - 11:00
     *
     * Result: false
     */
    private boolean overlaps(
            LocalTime slotStart,
            LocalTime slotEnd,
            LocalTime appointmentStart,
            LocalTime appointmentEnd) {

        return slotStart.isBefore(appointmentEnd)
                && slotEnd.isAfter(appointmentStart);
    }

    private boolean isSlotOccupied(
            List<Appointment> appointments,
            LocalTime slotStart,
            LocalTime slotEnd) {

        return appointments.stream()
                .anyMatch(appointment -> isBlockingAppointment(appointment)
                        && overlaps(
                                slotStart,
                                slotEnd,
                                appointment.getStartTime(),
                                appointment.getEndTime()));
    }
}
