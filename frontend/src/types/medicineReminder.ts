export interface MedicineReminder {
    id: string,
    medicineId: string,
    medicineName: string,
    genericName: string | null,
    strength: string | null,
    form: string | null,
    dosage: string,
    frequency: string,
    startDate: string,
    endDate: string | null,
    reminderTime: string | null,
    active: boolean,
    createdAt: string,
    updatedAt: string
}

export interface CreateMedicineReminderRequest {
    medicineId: string,
    dosage: string,
    frequency: string,
    startDate: string,
    endDate: string | null,
    reminderTime: string | null,
}

export type UpdateMedicineReminderRequest = Partial<Pick<CreateMedicineReminderRequest, 'dosage' | 'frequency' | 'startDate' | 'endDate' | 'reminderTime'>>