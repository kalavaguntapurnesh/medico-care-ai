export interface DoctorAvailability {
    id: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    active: boolean
}

export interface DoctorAvailabilityRequest {
    dayOfWeek: number,
    startTime: string,
    endTime: string
}