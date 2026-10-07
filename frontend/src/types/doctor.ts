import type { DoctorResponse } from "./doctor";

export interface DoctorResponse {
    id: string,
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    specialization: string,
    qualification: string,
    experienceYears: string,
    consultationFee: number | null,
    licenseNumber: string | null,
    approvalStatus: string,
    bio: string | null,
    createdAt: string,
    updatedAt: string
}

export interface AvailableSlotResponse {
    startTime: string,
    endTime: string
}