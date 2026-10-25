import { Bell, Menu, UserRound } from 'lucide-react'

import { Link } from "react-router-dom"

import { useAuth } from "../../context/AuthContext"
import { useNotifications } from '../../context/NotificationContext';

interface TopNavbarProps {
    onMenuClick: () => void

}

export default function TopNavbar({
    onMenuClick,
}: TopNavbarProps) {
    const { user } = useAuth();

    const { unreadCount } = useNotifications();

    if (!user) {
        return null;
    }

    const notificationPath =
        user.role === 'PATIENT'
            ? '/patient/notifications'
            : user.role === 'DOCTOR'
                ? '/doctor/notifications'
                : '/admin'

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        Welcome back
                    </p>

                    <p className="hidden text-sm font-semibold text-slate-900 sm:block">
                        {user.email}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    to={notificationPath}
                    aria-label={
                        unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifcations'
                    }
                    className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >

                    <Bell size={21} />
                    {unreadCount > 0 && (
                        <span className='absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white'>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}

                </Link>

                <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <UserRound size={18} />
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">
                            {user.role}
                        </p>

                        <p className="text-xs text-slate-500">
                            Account
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}