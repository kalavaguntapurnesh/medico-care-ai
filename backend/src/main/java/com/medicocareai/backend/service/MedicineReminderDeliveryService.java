package com.medicocareai.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.notification.CreateNotificationRequest;
import com.medicocareai.backend.entity.MedicineReminder;
import com.medicocareai.backend.entity.MedicineReminderNotificationLog;
import com.medicocareai.backend.repository.MedicineReminderNotificationLogRepository;

@Service
public class MedicineReminderDeliveryService {

    private final MedicineReminderNotificationLogRepository logRepository;
    private final NotificationService notificationService;

    public MedicineReminderDeliveryService(
            MedicineReminderNotificationLogRepository logRepository,
            NotificationService notificationService) {
        this.logRepository = logRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void processReminder(
            MedicineReminder reminder,
            LocalDate today,
            LocalDateTime now) {

        if (!reminder.isActive()) {
            return;
        }

        if (reminder.getReminderTime() == null) {
            return;
        }

        if (today.isBefore(reminder.getStartDate())) {
            return;
        }

        if (reminder.getEndDate() != null
                && today.isAfter(reminder.getEndDate())) {
            return;
        }

        UUID reminderId = reminder.getId();

        if (logRepository.existsByReminder_IdAndScheduledDate(
                reminderId, today)) {
            return;
        }

        // Record the reminder in the current transaction.
        MedicineReminderNotificationLog log = new MedicineReminderNotificationLog();

        log.setReminder(reminder);
        log.setScheduledDate(today);
        log.setSentAt(now);

        // Flush now so a duplicate daily log fails before notification creation.
        logRepository.saveAndFlush(log);

        CreateNotificationRequest request = new CreateNotificationRequest();

        request.setUserId(reminder.getPatient().getUser().getId());
        request.setType("MEDICINE_REMINDER");
        request.setTitle("Time to take your medicine");
        request.setMessage(
                "It is time for " + reminder.getMedicine().getName()
                        + ". Dosage: " + reminder.getDosage()
                        + ". Follow your clinician's instructions.");
        request.setReferenceType("MEDICINE_REMINDER");
        request.setReferenceId(reminderId);

        // If notification creation fails, the transaction rolls back too.
        notificationService.createNotification(request);
    }
}