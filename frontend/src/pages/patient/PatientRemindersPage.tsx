
import { useCallback, useEffect, useMemo, useState } from 'react'


import { getMyPatientPrescriptions } from '../../services/prescription.service'

import { createMedicineReminder, deactivateMedicineReminder, getMyMedicineReminders } from '../../services/medicineReminder.service'

import type { Prescription } from '../../types/prescription'
import type { MedicineReminder } from '../../types/medicineReminder'

interface PrescriptionMedicine {
    key: string
    prescriptionId: string
    prescriptionDate: string
    medicineId: string
    medicineName: string
    strength: string | null
    form: string | null
    dosage: string
    frequency: string
    durationDays: number | null
}

const todayLocal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const addDays = (date: string, days: number) => {
    const [year, month, day] = date.split('-').map(Number)
    const result = new Date(year, month - 1, day)
    result.setDate(result.getDate() + days)

    const y = result.getFullYear()
    const m = String(result.getMonth() + 1).padStart(2, '0')
    const d = String(result.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (
            error as { response?: { data?: { message?: string } } }
        ).response

        if (response?.data?.message) return response.data.message
    }

    if (error instanceof Error) return error.message
    return 'Something went wrong. Please try again.'
}

export default function PatientRemindersPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [reminders, setReminders] = useState<MedicineReminder[]>([])

    const [selectedMedicineKey, setSelectedMedicineKey] = useState('')
    const [startDate, setStartDate] = useState(todayLocal())
    const [endDate, setEndDate] = useState('')
    const [reminderTime, setReminderTime] = useState('09:00')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const [prescriptionData, reminderData] = await Promise.all([
                getMyPatientPrescriptions(),
                getMyMedicineReminders(),
            ])

            setPrescriptions(prescriptionData)
            setReminders(reminderData)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const prescribedMedicines = useMemo<PrescriptionMedicine[]>(
        () =>
            prescriptions.flatMap((prescription) =>
                prescription.items.map((item) => ({
                    key: `${prescription.id}:${item.id}`,
                    prescriptionId: prescription.id,
                    prescriptionDate: prescription.prescriptionDate,
                    medicineId: item.medicineId,
                    medicineName: item.medicineName,
                    strength: item.strength,
                    form: item.form,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    durationDays: item.durationDays,
                })),
            ),
        [prescriptions],
    )

    const selectedMedicine = prescribedMedicines.find(
        (medicine) => medicine.key === selectedMedicineKey,
    )

    const activeReminders = reminders.filter((reminder) => {
        if (!reminder.active) return false
        if (reminder.endDate && reminder.endDate < todayLocal()) return false
        return true
    })

    const handleMedicineChange = (key: string) => {
        setSelectedMedicineKey(key)
        setError('')
        setSuccess('')

        const medicine = prescribedMedicines.find((item) => item.key === key)
        const start = todayLocal()

        setStartDate(start)
        setEndDate(
            medicine?.durationDays
                ? addDays(start, medicine.durationDays - 1)
                : '',
        )
    }

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!selectedMedicine) {
            setError('Select a medicine from one of your prescriptions.')
            return
        }

        if (endDate && endDate < startDate) {
            setError('The end date cannot be earlier than the start date.')
            return
        }

        setSaving(true)

        try {
            await createMedicineReminder({
                medicineId: selectedMedicine.medicineId,
                dosage: selectedMedicine.dosage,
                frequency: selectedMedicine.frequency,
                startDate,
                endDate: endDate || null,
                reminderTime: reminderTime || null,
            })

            setSuccess('Medicine reminder created successfully.')
            setSelectedMedicineKey('')
            setStartDate(todayLocal())
            setEndDate('')
            setReminderTime('09:00')

            await loadData()
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    const handleDeactivate = async (reminder: MedicineReminder) => {
        const confirmed = window.confirm(
            `Deactivate the reminder for ${reminder.medicineName}?`,
        )

        if (!confirmed) return

        setError('')
        setSuccess('')
        setDeactivatingId(reminder.id)

        try {
            await deactivateMedicineReminder(reminder.id)
            setSuccess('Reminder deactivated.')
            await loadData()
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setDeactivatingId(null)
        }
    }

    if (loading) {
        return <div className="p-6 text-gray-600">Loading medicine reminders...</div>
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">
                    Medicine Reminders
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Organise reminders for medicines prescribed to you.
                </p>
            </header>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                    {success}
                </div>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Create a reminder
                </h2>

                {prescribedMedicines.length === 0 ? (
                    <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                        You don't have any prescription medicines available to set up
                        reminders for yet.
                    </p>
                ) : (
                    <form onSubmit={handleCreate} className="mt-5 space-y-5">
                        <div>
                            <label
                                htmlFor="prescribedMedicine"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Prescribed medicine
                            </label>

                            <select
                                id="prescribedMedicine"
                                value={selectedMedicineKey}
                                onChange={(event) => handleMedicineChange(event.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Choose a prescribed medicine</option>

                                {prescribedMedicines.map((medicine) => (
                                    <option key={medicine.key} value={medicine.key}>
                                        {medicine.medicineName}
                                        {medicine.strength ? ` — ${medicine.strength}` : ''}
                                        {` (prescribed ${medicine.prescriptionDate})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedMedicine && (
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="font-medium text-gray-900">
                                    {selectedMedicine.medicineName}
                                    {selectedMedicine.strength
                                        ? ` — ${selectedMedicine.strength}`
                                        : ''}
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    Dosage: {selectedMedicine.dosage}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Frequency: {selectedMedicine.frequency}
                                </p>

                                {selectedMedicine.durationDays != null && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Prescribed duration: {selectedMedicine.durationDays} days
                                    </p>
                                )}

                                <p className="mt-3 text-xs text-gray-500">
                                    Dosage and frequency are copied from the prescription. This
                                    reminder does not change your prescription.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Start date
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    min={todayLocal()}
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    End date (optional)
                                </label>
                                <input
                                    id="endDate"
                                    type="date"
                                    min={startDate}
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="reminderTime"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Reminder time
                                </label>
                                <input
                                    id="reminderTime"
                                    type="time"
                                    value={reminderTime}
                                    onChange={(event) => setReminderTime(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            The default end date, when available, is calculated from the
                            prescribed duration. Review the dates against your clinician's
                            instructions before saving.
                        </p>

                        <button
                            type="submit"
                            disabled={saving || !selectedMedicine}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Creating reminder...' : 'Create reminder'}
                        </button>
                    </form>
                )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Your reminders
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Review active reminders and deactivate ones you no longer need.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadData()}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>

                {reminders.length === 0 ? (
                    <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                        You haven't created any medicine reminders yet.
                    </p>
                ) : (
                    <div className="mt-5 space-y-3">
                        {reminders.map((reminder) => {
                            const expired =
                                !!reminder.endDate && reminder.endDate < todayLocal()
                            const isActive = reminder.active && !expired

                            return (
                                <article
                                    key={reminder.id}
                                    className="rounded-lg border border-gray-200 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {reminder.medicineName}
                                                {reminder.strength ? ` — ${reminder.strength}` : ''}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Dosage: {reminder.dosage}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Frequency: {reminder.frequency}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                {reminder.startDate}
                                                {reminder.endDate ? ` – ${reminder.endDate}` : ' – No end date set'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Reminder time: {reminder.reminderTime || 'Not set'}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${isActive
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {isActive ? 'Active' : expired ? 'Expired' : 'Inactive'}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <button
                                            type="button"
                                            onClick={() => void handleDeactivate(reminder)}
                                            disabled={deactivatingId === reminder.id}
                                            className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {deactivatingId === reminder.id
                                                ? 'Deactivating...'
                                                : 'Deactivate reminder'}
                                        </button>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>

            <p className="text-xs leading-5 text-gray-500">
                Medicine reminders are organisational aids. They do not replace your
                clinician's instructions, and creating or deactivating a reminder does
                not start, stop, or change your prescribed treatment.
            </p>
        </div>
    )
}
