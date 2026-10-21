import api from "./api"

import type { MedicineOption } from "../types/medicine"

export const getActiveMedicines = async (): Promise<MedicineOption[]> => {
    const response = await api.get<MedicineOption[]>(
        '/medicines/active'

    )
    return response.data
}