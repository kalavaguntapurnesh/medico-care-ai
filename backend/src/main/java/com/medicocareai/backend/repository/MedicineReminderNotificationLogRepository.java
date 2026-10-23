
package com.medicocareai.backend.repository;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicocareai.backend.entity.MedicineReminderNotificationLog;

public interface MedicineReminderNotificationLogRepository
        extends JpaRepository<MedicineReminderNotificationLog, UUID> {

    boolean existsByReminder_IdAndScheduledDate(
            UUID reminderId,
            LocalDate scheduledDate
    );
}
