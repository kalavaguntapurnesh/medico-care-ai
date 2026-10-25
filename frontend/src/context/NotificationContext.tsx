import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getUnreadNotificationCount } from "../services/notification.service";

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    decrementUnreadCount: () => void;
    clearUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({
    children,
}: NotificationProviderProps) {
    const { user } = useAuth();

    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = useCallback(async () => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to load unread notification count : ", error);
        }
    }, [user])

    const decrementUnreadCount = useCallback(() => {
        setUnreadCount((count) => Math.max(0, count - 1));
    }, []);

    const clearUnreadCount = useCallback(() => {
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        setUnreadCount(0);
        if (user) {
            void refreshUnreadCount();
        }
    }, [user, refreshUnreadCount]);


    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                refreshUnreadCount,
                decrementUnreadCount,
                clearUnreadCount
            }}

        >

            {children}
        </NotificationContext.Provider>
    )
}


export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used within notificaitonprovider')
    }

    return context;
}