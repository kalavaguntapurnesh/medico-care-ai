import api from './api'

import type { CreateMedicalRecordRequest, MedicalRecord } from '../types/medicalRecord'

const BASE_PATH = '/medical-records'

export async function getMyMedicalRecords(): Promise<MedicalRecord[]> {

    const response = await api.get<MedicalRecord[]>(`${BASE_PATH}/me`);
    return response.data

}


export async function createMedicalRecord(request: CreateMedicalRecordRequest, file: File): Promise<MedicalRecord> {
    const formData = new FormData();

    formData.append('recordType', request.recordType);
    formData.append('title', request.title);

    if (request.description?.trim()) {
        formData.append('description', request.description.trim());
    }

    if (request.recordDate) {
        formData.append('recordDate', request.recordDate);
    }

    formData.append('file', file);

    const response = await api.post<MedicalRecord>(BASE_PATH, formData);

    return response.data;

}


export async function downloadMedicalRecord(id: string,): Promise<Blob> {
    const response = await api.get(`${BASE_PATH}/me/${id}/download`, { responseType: 'blob' });

    return response.data as Blob;

}


export async function deleteMedicalRecord(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/me/${id}`);
}