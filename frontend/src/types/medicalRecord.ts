export interface MedicalRecord {
    id: string,
    patientId: string,
    uploadedBy: string,
    uploadedByEmail: string,
    recordType: string,
    title: string,
    description: string | null,
    fileName: string,
    downloadUrl: string,
    mimeType: string,
    fileSize: number,
    recordDate: string | null,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null
}


export interface CreateMedicalRecordRequest {
    recordType: string,
    title: string,
    description?: string,
    recordDate?: string
}