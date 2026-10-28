import api from "./api"
import type { Clinic, ClinicRequest } from "../types/clinic"

const BASE_PATH = '/clinics'

export async function getClinics(): Promise<Clinic[]> {
    const response = await api.get<Clinic[]>(BASE_PATH);
    return response.data

}

export async function getClinicById(id: string): Promise<Clinic> {

    const response = await api.get<Clinic>(`${BASE_PATH}/${id}`)
    return response.data
}


export async function createClinin(request: ClinicRequest): Promise<Clinic> {
    const response = await api.post<Clinic>(BASE_PATH, request);
    return response.data

}

export async function updateClinic(id: string, request: Partial<ClinicRequest>): Promise<Clinic> {
    const response = await api.put<Clinic>(`${BASE_PATH}/${id}`)
    return response.data

}

export async function deactivateClinic(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`)

}