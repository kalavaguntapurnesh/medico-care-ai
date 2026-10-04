import api from './api'

import type { Appointment } from '../types/appointment'

export interface CreateAppointmentRequest {
    doctorId: string,
    appointmentDate: string,
    startTime: string,
    endTime: string,
    reason?: string
}

export const getMyAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(
        '/appointments/me',
    )

    return response.data
}



export const getMyAppointment = async (
    appointmentId: string,
): Promise<Appointment> => {
    const response = await api.get<Appointment>(
        `/appointments/me/${appointmentId}`
    )

    return response.data

}


export const createAppointment = async (
    request: CreateAppointmentRequest,
): Promise<Appointment> => {
    const response = await api.post<Appointment>(
        '/appointments',
        request
    )
    return response.data
}


export const cancelAppointment = async (
    appointmentId: string,
): Promise<Appointment> => {
    const response = await api.put<Appointment>(
        `/appointments/me/${appointmentId}/cancel`,

    )
    return response.data
}