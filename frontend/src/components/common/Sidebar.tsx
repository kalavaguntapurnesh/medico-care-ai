import {
    Activity,
    CalendarDays,
    ClipboardList,
    FileText,
    Hospital,
    LayoutDashboard,
    LogOut,
    Pill,
    Stethoscope,
    UserRound,
    Users,
    X,
    Clock,
    Bell,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'

interface SidebarProps {
    mobileOpen: boolean
    onClose: () => void
}

interface NavigationItem {
    label: string
    path: string
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const navigation: Record<UserRole, NavigationItem[]> = {
    PATIENT: [
        {
            label: 'Dashboard',
            path: '/patient',
            icon: LayoutDashboard,
        },
        {
            label: 'Appointments',
            path: '/patient/appointments',
            icon: CalendarDays,
        },
        {
            label: 'Book Appointment',
            path: '/patient/book-appointment',
            icon: Stethoscope,
        },
        {
            label: 'Medical Records',
            path: '/patient/medical-records',
            icon: FileText,
        },
        {
            label: 'Prescriptions',
            path: '/patient/prescriptions',
            icon: ClipboardList,
        },
        {
            label: 'Medicine Reminders',
            path: '/patient/reminders',
            icon: Pill,
        },
        {
            label: 'Notifications',
            path: '/patient/notifications',
            icon: Bell,
        },
        {
            label: 'Clinics',
            path: '/patient/clinics',
            icon: Hospital,
        },
    ],

    DOCTOR: [
        {
            label: 'Dashboard',
            path: '/doctor',
            icon: LayoutDashboard,
        },
        {
            label: 'Appointments',
            path: '/doctor/appointments',
            icon: CalendarDays,
        },
        {
            label: 'Patients',
            path: '/doctor/patients',
            icon: Users,
        },
        {
            label: 'Prescriptions',
            path: '/doctor/prescriptions',
            icon: ClipboardList,
        },
        {
            label: 'Availability',
            path: '/doctor/availability',
            icon: Clock,
        },
        {
            label: 'Notifications',
            path: '/doctor/notifications',
            icon: Bell,
        },
    ],

    ADMIN: [
        {
            label: 'Dashboard',
            path: '/admin',
            icon: LayoutDashboard,
        },
        {
            label: 'Users',
            path: '/admin/users',
            icon: Users,
        },
        {
            label: 'Doctors',
            path: '/admin/doctors',
            icon: Stethoscope,
        },
        {
            label: 'Clinics',
            path: '/admin/clinics',
            icon: Hospital,
        },
        {
            label: 'Audit Logs',
            path: '/admin/audit-logs',
            icon: Activity,
        },
    ],
}

export default function Sidebar({
    mobileOpen,
    onClose,
}: SidebarProps) {
    const { user, logout } = useAuth()

    if (!user) {
        return null
    }

    const items = navigation[user.role]

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-200
          lg:static lg:z-auto lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Logo */}
                <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Activity size={22} />
                        </div>

                        <div>
                            <p className="text-base font-bold text-slate-900">
                                Medico Care
                            </p>

                            <p className="text-xs text-slate-500">
                                AI Healthcare
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Menu
                    </p>

                    <div className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === `/${user.role.toLowerCase()}`}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `
                    flex items-center gap-3 rounded-xl px-3 py-3
                    text-sm font-medium transition
                    ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                    `
                                    }
                                >
                                    <Icon size={19} strokeWidth={2} />
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </div>
                </nav>

                {/* User section */}
                <div className="border-t border-slate-200 p-4">
                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <UserRound size={19} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {user.email}
                            </p>

                            <p className="text-xs font-medium text-slate-500">
                                {user.role}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}