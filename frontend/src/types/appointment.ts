export type AppointmentStatus = 
    | 'PENDING'
    | 'CONFIRMED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'COMPLETED'


export interface Appointment {
    id: string
    patientId : string
    doctorId : string
    appointmentDate : string
    startTime : string
    endTime : string
    status : AppointmentStatus
    reason : string | null
    notes : string | null
    createdAt : string
    updatedAt : string
}