import { Bell, Menu, UserRound } from 'lucide-react'

import { Link } from "react-router-dom"

import { useAuth } from "../../context/AuthContext"

interface TopNavbarProps {
    onMenuClick: () => void

}

export default function TopNavbar({
    onMenuClick,
}: TopNavbarProps) {
    const { user } = useAuth();

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
                    className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
                    aria-label="Notifications"
                >
                    <Bell size={21} />
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