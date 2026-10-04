import { useEffect, useState } from "react";
import type { Appointment } from "../../types/appointment";
import { cancelAppointment, getMyAppointments } from "../../services/appointment.service";

import {
    CalendarDays,
    Clock3,
    Eye,
    XCircle,
} from 'lucide-react'

export default function PatientAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        loadAppointments()
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError('')
            const data = await getMyAppointments();
            setAppointments(data);
        } catch (error) {
            setError('Unable to load your appointments');
        }
        finally {
            setLoading(false);
        }
    }

    const handleCancel = async (
        appointmentId: string,
    ) => {
        const confirmed = window.confirm('Are you sure you want to cancel this appointment ?');
        if (!confirmed) {
            return
        }

        try {
            setCancellingId(appointmentId);
            setError('')
            await cancelAppointment(appointmentId);
            await loadAppointments();
            setSelectedAppointment(null);
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                'Unable to cancel the appointment.',
            )
        }
        finally {
            setCancellingId(null);
        }
    }



    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Appointments
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    View and manage your appointments.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                    Loading appointments...
                </div>
            ) : appointments.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                    <CalendarDays
                        size={40}
                        className="mx-auto text-slate-400"
                    />

                    <h2 className="mt-4 font-semibold text-slate-900">
                        No appointments
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        You don't have any appointments yet.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Time
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Reason
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {appointments.map(
                                    (appointment) => (
                                        <tr
                                            key={appointment.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                                    <CalendarDays
                                                        size={17}
                                                        className="text-slate-400"
                                                    />

                                                    {appointment.appointmentDate}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock3
                                                        size={17}
                                                        className="text-slate-400"
                                                    />

                                                    {appointment.startTime} -{' '}
                                                    {appointment.endTime}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {appointment.reason ||
                                                    '—'}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    status={
                                                        appointment.status
                                                    }
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedAppointment(
                                                                appointment,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>

                                                    {(appointment.status ===
                                                        'PENDING' ||
                                                        appointment.status ===
                                                        'CONFIRMED') && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    cancellingId ===
                                                                    appointment.id
                                                                }
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        appointment.id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <XCircle size={16} />

                                                                {cancellingId ===
                                                                    appointment.id
                                                                    ? 'Cancelling...'
                                                                    : 'Cancel'}
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() =>
                        setSelectedAppointment(null)
                    }
                />
            )}
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


interface AppointmentDetailsModalProps {
    appointment: Appointment
    onClose: () => void
}

function AppointmentDetailsModal({
    appointment,
    onClose
}: AppointmentDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Appointment Details
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                        Close
                    </button>
                </div>

                <div className="space-y-4 px-6 py-6">
                    <Detail
                        label="Date"
                        value={appointment.appointmentDate}
                    />

                    <Detail
                        label="Time"
                        value={`${appointment.startTime} - ${appointment.endTime}`}
                    />

                    <Detail
                        label="Status"
                        value={appointment.status}
                    />

                    <Detail
                        label="Reason"
                        value={
                            appointment.reason || 'Not provided'
                        }
                    />

                    <Detail
                        label="Notes"
                        value={
                            appointment.notes || 'No notes'
                        }
                    />
                </div>

                <div className="border-t border-slate-200 px-6 py-4 text-right">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}


interface DetailProps {
    label: string,
    value: string
}

function Detail({
    label,
    value,
}: DetailProps) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm text-slate-700">
                {value}
            </p>
        </div>
    )
}