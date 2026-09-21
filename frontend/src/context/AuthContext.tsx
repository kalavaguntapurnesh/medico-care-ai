import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

import type { AuthUser, LoginRequest } from '../types/auth'
import {
    login as loginApi,
    logout as logoutApi,
    saveAuth,
} from '../services/auth.service'

interface AuthContextType {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (request: LoginRequest) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<
    AuthContextType | undefined
>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(
        null,
    )

    useEffect(() => {
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem('user')
                localStorage.removeItem('accessToken')
            }
        }
    }, [])

    const login = async (
        request: LoginRequest,
    ): Promise<void> => {
        const response = await loginApi(request)

        saveAuth(response)

        setUser({
            userId: response.userId,
            email: response.email,
            role: response.role,
        })
    }

    const logout = (): void => {
        logoutApi()
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider',
        )
    }

    return context
}