import api from './api'
import type {
    LoginRequest,
    LoginResponse,
} from '../types/auth'


export const login = async (
    request: LoginRequest,
): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
        '/auth/login',
        request
    )

    return response.data
}


export const logout = (): void => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
}

export const saveAuth = (
    response: LoginResponse,
): void => {
    localStorage.setItem('accessToken', response.accessToken)

    localStorage.setItem(
        'user',
        JSON.stringify({
            userId: response.userId,
            email: response.email,
            role: response.role,
        }),
    )
}