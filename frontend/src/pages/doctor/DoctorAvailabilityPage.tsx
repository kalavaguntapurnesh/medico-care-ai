
import { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    X,
} from 'lucide-react';

import {
    createAvailability,
    deactiveAvailability,
    getMyAvailability,
    updateAvailability,
} from '../../services/doctorAvailability.service';

import type {
    DoctorAvailability,
    DoctorAvailabilityRequest,
} from '../../types/doctorAvailability';

const DAYS = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
];

const EMPTY_FORM: DoctorAvailabilityRequest = {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
};

function formatTime(time: string) {
    return time.slice(0, 5);
}

function getDayLabel(dayOfWeek: number) {
    return DAYS.find((day) => day.value === dayOfWeek)?.label ?? 'Unknown day';
}

export default function DoctorAvailabilityPage() {
    const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
    const [form, setForm] = useState<DoctorAvailabilityRequest>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadAvailability = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getMyAvailability();

            setAvailability(
                [...data].sort((a, b) => {
                    const dayDifference =
                        DAYS.findIndex((day) => day.value === a.dayOfWeek) -
                        DAYS.findIndex((day) => day.value === b.dayOfWeek);

                    return dayDifference || a.startTime.localeCompare(b.startTime);
                }),
            );
        } catch {
            setError('Unable to load your availability. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAvailability();
    }, [loadAvailability]);

    function resetForm() {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setError('');
    }

    function startEditing(item: DoctorAvailability) {
        setEditingId(item.id);
        setForm({
            dayOfWeek: item.dayOfWeek,
            startTime: formatTime(item.startTime),
            endTime: formatTime(item.endTime),
        });

        setError('');
        setSuccess('');

        document.getElementById('availability-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (form.startTime >= form.endTime) {
            setError('End time must be later than start time.');
            return;
        }

        setSaving(true);

        try {
            const request = {
                dayOfWeek: Number(form.dayOfWeek),
                startTime: form.startTime,
                endTime: form.endTime,
            };

            if (editingId) {
                await updateAvailability(editingId, request);
                setSuccess('Availability updated successfully.');
            } else {
                await createAvailability(request);
                setSuccess('Availability added successfully.');
            }

            resetForm();
            await loadAvailability();
        } catch (err: unknown) {
            const message =
                typeof err === 'object' &&
                    err !== null &&
                    'response' in err &&
                    typeof err.response === 'object' &&
                    err.response !== null &&
                    'data' in err.response &&
                    typeof err.response.data === 'object' &&
                    err.response.data !== null &&
                    'message' in err.response.data &&
                    typeof err.response.data.message === 'string'
                    ? err.response.data.message
                    : 'Unable to save availability. Please check your entries and try again.';

            setError(message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(item: DoctorAvailability) {
        const confirmed = window.confirm(
            `Deactivate your ${getDayLabel(item.dayOfWeek)} availability from ${formatTime(item.startTime)} to ${formatTime(item.endTime)}?`,
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');
        setDeactivatingId(item.id);

        try {
            await deactiveAvailability(item.id);
            setSuccess('Availability deactivated successfully.');

            if (editingId === item.id) {
                resetForm();
            }

            await loadAvailability();
        } catch {
            setError('Unable to deactivate this availability. Please try again.');
        } finally {
            setDeactivatingId(null);
        }
    }

    const activeCount = availability.filter((item) => item.active).length;
    const inactiveCount = availability.length - activeCount;

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
                        <CalendarDays size={17} />
                        Doctor workspace
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Availability Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        Manage your recurring weekly working hours. Patients can book
                        appointments only in available slots that pass the backend checks.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadAvailability()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard label="Total time blocks" value={availability.length} />
                <SummaryCard label="Active time blocks" value={activeCount} />
                <SummaryCard label="Inactive time blocks" value={inactiveCount} />
            </div>

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                    <CheckCircle2 size={18} />
                    {success}
                </div>
            )}

            <section
                id="availability-form"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
                <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                        {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-900">
                            {editingId ? 'Edit availability' : 'Add working hours'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Set the day and time range when you accept appointments.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label
                                htmlFor="availability-day"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Day of week
                            </label>

                            <select
                                id="availability-day"
                                value={form.dayOfWeek}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        dayOfWeek: Number(event.target.value),
                                    }))
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {DAYS.map((day) => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="availability-start"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Start time
                            </label>

                            <input
                                id="availability-start"
                                type="time"
                                value={form.startTime}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        startTime: event.target.value,
                                    }))
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="availability-end"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                End time
                            </label>

                            <input
                                id="availability-end"
                                type="time"
                                value={form.endTime}
                                min={form.startTime}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        endTime: event.target.value,
                                    }))
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {editingId ? <Pencil size={16} /> : <Plus size={17} />}
                            {saving
                                ? 'Saving...'
                                : editingId
                                    ? 'Save changes'
                                    : 'Add availability'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <X size={16} />
                                Cancel editing
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Your weekly schedule
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Active blocks can be used for booking, subject to appointment
                        conflicts and server-side validation.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                        Loading your availability...
                    </div>
                ) : availability.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                        <CalendarDays className="mx-auto mb-3 text-gray-400" size={32} />
                        <h3 className="font-medium text-gray-900">
                            No availability configured
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Add your first weekly working-hours block above.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {DAYS.map((day) => {
                            const dayItems = availability.filter(
                                (item) => item.dayOfWeek === day.value,
                            );

                            if (dayItems.length === 0) return null;

                            return (
                                <div
                                    key={day.value}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                >
                                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                                        <h3 className="font-semibold text-gray-800">
                                            {day.label}
                                        </h3>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {dayItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                                                        <Clock size={19} />
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {formatTime(item.startTime)} –{' '}
                                                            {formatTime(item.endTime)}
                                                        </p>

                                                        <span
                                                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.active
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {item.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(item)}
                                                        disabled={!item.active || saving}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <Pencil size={15} />
                                                        Edit
                                                    </button>

                                                    {item.active && (
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleDeactivate(item)}
                                                            disabled={deactivatingId === item.id}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            <Trash2 size={15} />
                                                            {deactivatingId === item.id
                                                                ? 'Deactivating...'
                                                                : 'Deactivate'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
