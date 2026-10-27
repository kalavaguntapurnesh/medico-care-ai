import api from "./api";

import type { User } from "../types/user";

export const getAllUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data
}

export const getUserById = async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data
}