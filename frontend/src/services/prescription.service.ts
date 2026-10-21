import api from './api'

import type { CreatePrescriptionRequest, Prescription } from '../types/prescription'

export const CreatePrescription = async (
    request: CreatePrescriptionRequest,
): Promise<Prescription> => {
    const response = await api.post<Prescription>(
        '/prescriptions',
        request
    )

    return response.data;
}


export const getMyPatientPrescriptions = async (): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(
        '/prescriptions/me'
    )

    return response.data
}


export const getMyPatientPrescription = async (
    prescriptionId: string,
): Promise<Prescription> => {
    const response = await api.get<Prescription>(
        `/prescriptions/me/${prescriptionId}`
    )
    return response.data
}


export const getMyDoctorPrescriptions = async (): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(
        '/prescriptions/doctor/me'
    )

    return response.data
}


export const getMyDoctorPrescription = async (
    prescriptionId: string,
): Promise<Prescription> => {
    const response = await api.get<Prescription>(
        `/prescriptions/doctor/me/${prescriptionId}`
    )
    return response.data
}