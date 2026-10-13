import api from './api'

import type { Appointment } from '../types/appointment'

export interface CreateAppointmentRequest {
    doctorId: string,
    appointmentDate: string,
    startTime: string,
    endTime: string,
    reason?: string,
    notes?: string
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


export interface DoctorAppointment extends Appointment {
    patientId: string;
    doctorId: string;
    patientEmail: string;
    patientFirstName: string;
    patientLastName: string;
    doctorEmail: string;
    doctorFirstName: string;
    doctorLastName: string;
    doctorSpecialization: string;
}

export const getDoctorAppointments = async (): Promise<DoctorAppointment[]> => {
    const response = await api.get<DoctorAppointment[]>(
        '/appointments/doctor/me'
    );

    return response.data;
}


export const updateDoctorAppointmentStatus = async (
    appointmentId: string,
    status: 'CONFIRMED' | 'REJECTED' | 'COMPLETED'
): Promise<DoctorAppointment> => {
    const response = await api.put<DoctorAppointment>(
        `/appointments/doctor/me/${appointmentId}/status`,
        { status }
    );

    return response.data;
}