package com.medicocareai.backend.service;

import com.medicocareai.backend.dto.doctoravailability.CreateDoctorAvailabilityRequest;
import com.medicocareai.backend.dto.doctoravailability.DoctorAvailabilityResponse;
import com.medicocareai.backend.dto.doctoravailability.UpdateDoctorAvailabilityRequest;
import com.medicocareai.backend.entity.Doctor;
import com.medicocareai.backend.entity.DoctorAvailability;
import com.medicocareai.backend.repository.DoctorAvailabilityRepository;
import com.medicocareai.backend.repository.DoctorRepository;
import com.medicocareai.backend.exception.BadRequestException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.security.CustomUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository doctorAvailabilityRepository,
            DoctorRepository doctorRepository) {

        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorAvailabilityResponse createAvailability(
            CustomUserPrincipal principal,
            CreateDoctorAvailabilityRequest request) {

        UUID doctorUserId = principal.getUserId();

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor profile not found"));

        validateNoOverlap(
                doctor.getId(),
                request.getDayOfWeek(),
                request.getStartTime(),
                request.getEndTime()
        );

        LocalDateTime now = LocalDateTime.now();

        DoctorAvailability availability = new DoctorAvailability();

        availability.setDoctor(doctor);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setActive(true);
        availability.setCreatedAt(now);
        availability.setUpdatedAt(now);

        DoctorAvailability saved =
                doctorAvailabilityRepository.save(availability);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponse> getMyAvailability(
            CustomUserPrincipal principal) {

        UUID doctorUserId = principal.getUserId();

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor profile not found"));

        return doctorAvailabilityRepository
                .findByDoctorIdAndActiveTrue(doctor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DoctorAvailabilityResponse updateAvailability(
            CustomUserPrincipal principal,
            UUID availabilityId,
            UpdateDoctorAvailabilityRequest request) {

        UUID doctorUserId = principal.getUserId();

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor profile not found"));

        DoctorAvailability availability =
                doctorAvailabilityRepository.findById(availabilityId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor availability not found"));

        /*
         * Security check:
         * The doctor can only modify their own availability.
         */
        if (!availability.getDoctor().getId().equals(doctor.getId())) {
            throw new ResourceNotFoundException(
                    "Doctor availability not found");
        }

        Short dayOfWeek = request.getDayOfWeek() != null
                ? request.getDayOfWeek()
                : availability.getDayOfWeek();

        var startTime = request.getStartTime() != null
                ? request.getStartTime()
                : availability.getStartTime();

        var endTime = request.getEndTime() != null
                ? request.getEndTime()
                : availability.getEndTime();

        Boolean active = request.getActive() != null
                ? request.getActive()
                : availability.isActive();

        if (endTime == null || startTime == null) {
            throw new BadRequestException(
                    "Start time and end time are required");
        }

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException(
                    "End time must be after start time");
        }

        /*
         * Only check overlap when the resulting availability
         * is active.
         */
        if (active) {
            validateNoOverlapForUpdate(
                    doctor.getId(),
                    dayOfWeek,
                    startTime,
                    endTime,
                    availabilityId
            );
        }

        availability.setDayOfWeek(dayOfWeek);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setActive(active);
        availability.setUpdatedAt(LocalDateTime.now());

        DoctorAvailability saved =
                doctorAvailabilityRepository.save(availability);

        return mapToResponse(saved);
    }

    public void deactivateAvailability(
            CustomUserPrincipal principal,
            UUID availabilityId) {

        UUID doctorUserId = principal.getUserId();

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor profile not found"));

        DoctorAvailability availability =
                doctorAvailabilityRepository.findById(availabilityId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor availability not found"));

        if (!availability.getDoctor().getId().equals(doctor.getId())) {
            throw new ResourceNotFoundException(
                    "Doctor availability not found");
        }

        availability.setActive(false);
        availability.setUpdatedAt(LocalDateTime.now());

        doctorAvailabilityRepository.save(availability);
    }

    private void validateNoOverlap(
            UUID doctorId,
            Short dayOfWeek,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime) {

        boolean overlap =
                doctorAvailabilityRepository
                        .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                                doctorId,
                                dayOfWeek,
                                endTime,
                                startTime
                        );

        if (overlap) {
            throw new BadRequestException(
                    "Doctor availability overlaps with an existing schedule");
        }
    }

    private void validateNoOverlapForUpdate(
            UUID doctorId,
            Short dayOfWeek,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            UUID availabilityId) {

        boolean overlap =
                doctorAvailabilityRepository
                        .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                                doctorId,
                                dayOfWeek,
                                endTime,
                                startTime,
                                availabilityId
                        );

        if (overlap) {
            throw new BadRequestException(
                    "Doctor availability overlaps with an existing schedule");
        }
    }

    private DoctorAvailabilityResponse mapToResponse(
            DoctorAvailability availability) {

        return DoctorAvailabilityResponse.builder()
                .id(availability.getId())
                .doctorId(availability.getDoctor().getId())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .active(availability.isActive())
                .createdAt(availability.getCreatedAt())
                .updatedAt(availability.getUpdatedAt())
                .build();
    }
}