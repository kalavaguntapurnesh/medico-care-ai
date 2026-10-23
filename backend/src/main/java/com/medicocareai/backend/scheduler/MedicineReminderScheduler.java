package com.medicocareai.backend.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.medicocareai.backend.entity.MedicineReminder;
import com.medicocareai.backend.repository.MedicineReminderRepository;
import com.medicocareai.backend.service.MedicineReminderDeliveryService;

@Component
public class MedicineReminderScheduler {

    private static final Logger log =
            LoggerFactory.getLogger(MedicineReminderScheduler.class);

    private static final ZoneId ZONE =
            ZoneId.of("Europe/London");

    private final MedicineReminderRepository reminderRepository;
    private final MedicineReminderDeliveryService deliveryService;

    public MedicineReminderScheduler(
            MedicineReminderRepository reminderRepository,
            MedicineReminderDeliveryService deliveryService) {
        this.reminderRepository = reminderRepository;
        this.deliveryService = deliveryService;
    }

    @Scheduled(cron = "0 * * * * *", zone = "Europe/London")
    public void processDueReminders() {
        LocalDateTime now = LocalDateTime.now(ZONE);
        LocalDate today = now.toLocalDate();
        LocalTime currentMinute = now.toLocalTime()
                .withSecond(0)
                .withNano(0);

        for (MedicineReminder reminder :
                reminderRepository.findByActiveTrue()) {

            if (reminder.getReminderTime() == null) {
                continue;
            }

            LocalTime reminderMinute = reminder.getReminderTime()
                    .withSecond(0)
                    .withNano(0);

            if (!reminderMinute.equals(currentMinute)) {
                continue;
            }

            try {
                deliveryService.processReminder(reminder, today, now);
            } catch (Exception exception) {
                log.error(
                    "Failed to process medicine reminder {}",
                    reminder.getId(),
                    exception
                );
            }
        }
    }
}