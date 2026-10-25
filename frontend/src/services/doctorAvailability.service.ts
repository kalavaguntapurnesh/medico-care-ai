import api from "./api";
import type { DoctorAvailability, DoctorAvailabilityRequest } from "../types/doctorAvailability";

const BASE_PATH = '/doctors/me/availability'

export async function getMyAvailability(): Promise<DoctorAvailability[]> {
    const response = await api.get<DoctorAvailability[]>(BASE_PATH);

    return response.data
}

export async function createAvailability(
    request: DoctorAvailabilityRequest,
): Promise<DoctorAvailability> {
    const response = await api.post<DoctorAvailability>(BASE_PATH, request);
    return response.data;
}


export async function updateAvailability(id: string, request: DoctorAvailabilityRequest,): Promise<DoctorAvailability> {
    const response = await api.put<DoctorAvailability>(`${BASE_PATH}/${id}`, request);
    return response.data
}


export async function deactiveAvailability(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`)

}

