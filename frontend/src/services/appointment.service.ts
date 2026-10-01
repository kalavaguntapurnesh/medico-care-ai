import api from './api'

import type { Appointment } from '../types/appointment'

export const getMyAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(
        '/appointments/me',
    )

    return response.data
}