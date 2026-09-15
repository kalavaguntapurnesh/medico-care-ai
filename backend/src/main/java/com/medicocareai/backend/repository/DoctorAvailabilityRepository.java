package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface DoctorAvailabilityRepository
                extends JpaRepository<DoctorAvailability, UUID> {

        List<DoctorAvailability> findByDoctorId(UUID doctorId);

        List<DoctorAvailability> findByDoctorIdAndActiveTrue(UUID doctorId);

        List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndActiveTrue(
                        UUID doctorId,
                        Short dayOfWeek);

        boolean existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                        UUID doctorId,
                        Short dayOfWeek,
                        LocalTime endTime,
                        LocalTime startTime);

        boolean existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                        UUID doctorId,
                        Short dayOfWeek,
                        LocalTime endTime,
                        LocalTime startTime,
                        UUID id);
}
