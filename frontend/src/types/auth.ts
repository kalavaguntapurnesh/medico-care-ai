export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export interface LoginRequest {
    email: string,
    password: string
}


export interface LoginResponse {
    accessToken: string,
    tokenType: string
    expiresIn: number,
    userId: string,
    email: string,
    role: UserRole
}


export interface AuthUser {
    userId: string,
    email: string,
    role: UserRole
}