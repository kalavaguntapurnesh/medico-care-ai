
CREATE TABLE medicine_reminder_notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reminder_id UUID NOT NULL
        REFERENCES medicine_reminders(id),

    scheduled_date DATE NOT NULL,

    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_reminder_notification_daily
        UNIQUE (reminder_id, scheduled_date)
);

CREATE INDEX idx_reminder_notification_log_date
    ON medicine_reminder_notification_log(scheduled_date);
