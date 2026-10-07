import api from "./api"

import type { DoctorResponse, AvailableSlotResponse } from "../types/doctor"

export const getApprovedDoctors = async (): Promise<DoctorResponse[]> => {
    const response = await api.get<DoctorResponse[]>("/doctors");

    return response.data
}

export const getDoctorAvailableSlots = async (
    doctorId: string,
    date: string
): Promise<AvailableSlotResponse[]> => {
    const response = await api.get<AvailableSlotResponse[]>(
        `/doctors/${doctorId}/availability`,
        {
            params: {
                date,

            },
        }
    );
    return response.data
}