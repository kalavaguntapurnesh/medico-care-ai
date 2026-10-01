import React, { useEffect, useMemo, useState } from "react"

import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react"

import { getMyAppointments } from "../../services/appointment.service"

import type { Appointment } from "../../types/appointment"

export default function PatientDashboard() {


    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                setError('');
                const data = await getMyAppointments();

                setAppointments(data);
            } catch {
                setError('Unable to load your appointments.')
            }
            finally {
                setLoading(false);
            }
        }
        loadAppointments();
    }, [])

    const statistics = useMemo(() => {
        return {
            total: appointments.length,

            pending: appointments.filter(
                (appointment) => appointment.status === 'PENDING',
            ).length,

            confirmed: appointments.filter(
                (appointment) => appointment.status === 'CONFIRMED'
            ).length,

            completed: appointments.filter(
                (appointment) => appointment.status === 'COMPLETED'
            ).length,
        }
    }, [appointments])

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Patient Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Overview of your healthcare activity.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-re-600">
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Total Appointments"
                    value={
                        loading
                            ? '—'
                            : String(statistics.total)
                    }
                    icon={CalendarDays}
                />

                <DashboardCard
                    title="Pending"
                    value={
                        loading
                            ? '—'
                            : String(statistics.pending)
                    }
                    icon={Clock3}
                />

                <DashboardCard
                    title="Confirmed"
                    value={
                        loading
                            ? '—'
                            : String(statistics.confirmed)
                    }
                    icon={CheckCircle2}
                />

                <DashboardCard
                    title="Completed"
                    value={
                        loading
                            ? '—'
                            : String(statistics.completed)
                    }
                    icon={XCircle}
                />
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Appointments</h2>

                    <p className="mt-1 text-sm text-slate-500">Your latest appointments</p>
                </div>

                {loading ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                        Loading appointments...
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                        You don't have any appointments yet
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.slice(0, 5).map((appointment) => (
                            <AppointmentRow
                                key={appointment.id}
                                appointment={appointment}
                            />
                        ))}

                    </div>
                )}
            </div>

        </div>
    )
}

interface DashboardCardProps {
    title: string
    value: string
    icon: React.ComponentType<{
        size?: number
        strokeWidth?: number
    }>
}

function DashboardCard({
    title,
    value,
    icon: Icon,
}: DashboardCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Icon size={21} />
                </div>
            </div>
        </div>
    )
}


interface AppointmentRowProps {
    appointment: Appointment
}


function AppointmentRow({
    appointment,
}: AppointmentRowProps) {
    return (
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="font-medium text-slate-900">{appointment.appointmentDate}</p>

                <p className="mt-1 text-sm text-slate-500">
                    {appointment.startTime} - {' '}
                    {appointment.endTime}
                </p>

                {appointment.reason && (
                    <p className="mt-1 text-sm text-slate-500">
                        {appointment.reason}
                    </p>
                )}

            </div>

            <StatusBadge status={appointment.status} />
        </div>
    )
}


interface StatusBadgeProps {
    status: Appointment['status']
}


function StatusBadge({
    status,
}: StatusBadgeProps) {
    const styles: Record<
        Appointment['status'],
        string
    > = {
        PENDING:
            'bg-yellow-50 text-yellow-700',
        CONFIRMED:
            'bg-green-50 text-green-700',
        REJECTED:
            'bg-red-50 text-red-700',
        CANCELLED:
            'bg-slate-100 text-slate-600',
        COMPLETED:
            'bg-blue-50 text-blue-700',
    }

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
        >
            {status}
        </span>
    )
}