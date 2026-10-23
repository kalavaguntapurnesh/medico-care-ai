import api from './api'

import type { CreateMedicineReminderRequest, MedicineReminder, UpdateMedicineReminderRequest } from '../types/medicineReminder'

export const getMyMedicineReminders = async (): Promise<MedicineReminder[]> => {
    const response = await api.get<MedicineReminder[]>('/medicine-reminders/me');
    return response.data;


}


export const getMyMedicineReminder = async (
    reminderId: string,

): Promise<MedicineReminder> => {
    const response = await api.get<MedicineReminder>(`/medicine-reminders/me/${reminderId}`,

    )
    return response.data;
}


export const createMedicineReminder = async (
    request: CreateMedicineReminderRequest,
): Promise<MedicineReminder> => {
    const response = await api.post<MedicineReminder>(
        '/medicine-reminders',
        request,
    )

    return response.data
}


export const updateMedicineReminder = async (reminderId: string, request: UpdateMedicineReminderRequest,

): Promise<MedicineReminder> => {

    const response = await api.put<MedicineReminder>(
        `/medicine-reminders/me/${reminderId}`,
        request
    )
    return response.data

}


export const deactivateMedicineReminder = async (
    reminderId: string,
): Promise<void> => {
    await api.delete(`/medicine-reminders/me/${reminderId}`)
}