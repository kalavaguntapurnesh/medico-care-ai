export interface PrescriptionItemRequest {
    medicineId: string,
    dosage: string,
    frequency: string,
    durationDays: number | null,
    instructions: string
}


export interface CreatePrescriptionRequest {
    patientId: string,
    appointmentId: string,
    prescriptionDate: string,
    notes: string,
    items: PrescriptionItemRequest[]
}


export interface PrescriptionItem {
    id: string,
    medicineId: string,
    medicineName: string,
    genericName: string | null,
    strength: string | null,
    form: string | null,
    dosage: string,
    frequency: string,
    durationDays: number | null,
    instructions: string | null
}


export interface Prescription {
    id: string,
    patientId: string,
    doctorId: string,
    appointmentId: string,
    prescriptionDate: string,
    notes: string | null,
    status: string,
    createdAt: string,
    updatedAt: string,
    items: PrescriptionItem[]
}