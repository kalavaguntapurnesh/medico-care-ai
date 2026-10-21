
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'


import { getDoctorAppointments } from '../../services/appointment.service'
import { getActiveMedicines } from '../../services/medicine.service'
// import {
//   createPrescription,
//   getMyDoctorPrescriptions,
// } from '../../services/prescriptionService'

import { CreatePrescription, getMyDoctorPrescription, getMyDoctorPrescriptions, getMyPatientPrescriptions } from '../../services/prescription.service'

// import type { DoctorAppointment } from '../../types/appointment'
import type { DoctorAppointment } from '../../services/appointment.service'
import type { MedicineOption } from '../../types/medicine'
import type {
  CreatePrescriptionRequest,
  Prescription,
  PrescriptionItemRequest,
} from '../../types/prescription'

interface MedicineFormItem {
  medicineId: string
  dosage: string
  frequency: string
  durationDays: string
  instructions: string
}

const todayLocal = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const emptyMedicine = (): MedicineFormItem => ({
  medicineId: '',
  dosage: '',
  frequency: '',
  durationDays: '',
  instructions: '',
})

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: { data?: { message?: string } }
    }).response

    if (response?.data?.message) {
      return response.data.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

const getPatientName = (appointment: DoctorAppointment) => {
  const name = [
    appointment.patientFirstName,
    appointment.patientLastName,
  ]
    .filter(Boolean)
    .join(' ')

  return name || `Patient ${appointment.patientId.slice(0, 8)}`
}

export default function DoctorPrescriptionsPage() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [medicines, setMedicines] = useState<MedicineOption[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  const [appointmentId, setAppointmentId] = useState('')
  const [prescriptionDate, setPrescriptionDate] = useState(todayLocal())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<MedicineFormItem[]>([
    emptyMedicine(),
  ])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [appointmentData, medicineData, prescriptionData] =
        await Promise.all([
          getDoctorAppointments(),
          getActiveMedicines(),
          getMyDoctorPrescriptions(),
        ])

      setAppointments(appointmentData)
      setMedicines(medicineData)
      setPrescriptions(prescriptionData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const prescribedAppointmentIds = useMemo(
    () => new Set(prescriptions.map((prescription) => prescription.appointmentId)),
    [prescriptions],
  )

  const availableAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === 'COMPLETED' &&
          !prescribedAppointmentIds.has(appointment.id),
      ),
    [appointments, prescribedAppointmentIds],
  )

  const selectedAppointment = appointments.find(
    (appointment) => appointment.id === appointmentId,
  )

  const updateItem = (
    index: number,
    field: keyof MedicineFormItem,
    value: string,
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    )
  }

  const addMedicine = () => {
    setItems((current) => [...current, emptyMedicine()])
  }

  const removeMedicine = (index: number) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedAppointment) {
      setError('Please select a completed appointment.')
      return
    }

    if (prescribedAppointmentIds.has(selectedAppointment.id)) {
      setError('This appointment already has a prescription.')
      return
    }

    if (items.some((item) => !item.medicineId || !item.dosage.trim() || !item.frequency.trim())) {
      setError('Select a medicine and enter the dosage and frequency for every item.')
      return
    }

    if (
      items.some(
        (item) =>
          item.durationDays.trim() !== '' &&
          (!Number.isInteger(Number(item.durationDays)) ||
            Number(item.durationDays) <= 0),
      )
    ) {
      setError('Duration must be a positive whole number of days.')
      return
    }

    const prescriptionItems: PrescriptionItemRequest[] = items.map((item) => ({
      medicineId: item.medicineId,
      dosage: item.dosage.trim(),
      frequency: item.frequency.trim(),
      durationDays:
        item.durationDays.trim() === ''
          ? null
          : Number(item.durationDays),
      instructions: item.instructions.trim(),
    }))

    const request: CreatePrescriptionRequest = {
      patientId: selectedAppointment.patientId,
      appointmentId: selectedAppointment.id,
      prescriptionDate,
      notes: notes.trim(),
      items: prescriptionItems,
    }

    setSubmitting(true)

    try {
      await CreatePrescription(request)

      setSuccess('Prescription created successfully.')
      setAppointmentId('')
      setPrescriptionDate(todayLocal())
      setNotes('')
      setItems([emptyMedicine()])

      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading prescriptions...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Prescriptions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create prescriptions for completed appointments and review
          previously issued prescriptions.
        </p>
      </div>

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
          Create prescription
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="appointment"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Completed appointment
              </label>

              <select
                id="appointment"
                value={appointmentId}
                onChange={(event) => setAppointmentId(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select an appointment</option>

                {availableAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {getPatientName(appointment)} — {appointment.appointmentDate}
                  </option>
                ))}
              </select>

              {availableAppointments.length === 0 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  No completed appointments without prescriptions are available.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="prescriptionDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Prescription date
              </label>

              <input
                id="prescriptionDate"
                type="date"
                value={prescriptionDate}
                max={todayLocal()}
                onChange={(event) => setPrescriptionDate(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {selectedAppointment && (
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-800">
                Patient: {getPatientName(selectedAppointment)}
              </p>
              <p className="mt-1 break-all text-gray-500">
                Patient ID: {selectedAppointment.patientId}
              </p>
              <p className="mt-1 text-gray-500">
                Appointment date: {selectedAppointment.appointmentDate}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">
                Medicines
              </h3>

              <button
                type="button"
                onClick={addMedicine}
                className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                + Add medicine
              </button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Medicine {index + 1}
                  </h4>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`medicine-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Medicine
                    </label>

                    <select
                      id={`medicine-${index}`}
                      value={item.medicineId}
                      onChange={(event) =>
                        updateItem(index, 'medicineId', event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select a medicine</option>

                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name}
                          {medicine.strength ? ` — ${medicine.strength}` : ''}
                          {medicine.form ? ` (${medicine.form})` : ''}
                          {medicine.genericName
                            ? ` · ${medicine.genericName}`
                            : ''}
                        </option>
                      ))}
                    </select>

                    {medicines.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        No active medicines were returned by the API.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`dosage-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Dosage
                    </label>
                    <input
                      id={`dosage-${index}`}
                      value={item.dosage}
                      onChange={(event) =>
                        updateItem(index, 'dosage', event.target.value)
                      }
                      placeholder="e.g. 1 tablet"
                      maxLength={100}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`frequency-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Frequency
                    </label>
                    <input
                      id={`frequency-${index}`}
                      value={item.frequency}
                      onChange={(event) =>
                        updateItem(index, 'frequency', event.target.value)
                      }
                      placeholder="e.g. As directed"
                      maxLength={100}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`duration-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Duration (days)
                    </label>
                    <input
                      id={`duration-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.durationDays}
                      onChange={(event) =>
                        updateItem(index, 'durationDays', event.target.value)
                      }
                      placeholder="Optional"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`instructions-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Instructions
                    </label>
                    <input
                      id={`instructions-${index}`}
                      value={item.instructions}
                      onChange={(event) =>
                        updateItem(index, 'instructions', event.target.value)
                      }
                      placeholder="Additional instructions (optional)"
                      maxLength={5000}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Prescription notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="Add relevant notes..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              availableAppointments.length === 0 ||
              medicines.length === 0
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Creating prescription...' : 'Create prescription'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Previous prescriptions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Prescriptions issued by you.
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

        {prescriptions.length === 0 ? (
          <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
            No prescriptions have been created yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {prescriptions.map((prescription) => {
              const appointment = appointments.find(
                (entry) => entry.id === prescription.appointmentId,
              )

              return (
                <article
                  key={prescription.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment
                          ? getPatientName(appointment)
                          : `Patient ${prescription.patientId.slice(0, 8)}`}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Date: {prescription.prescriptionDate}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {prescription.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {prescription.items.map((prescriptionItem) => (
                      <div
                        key={prescriptionItem.id}
                        className="rounded-lg bg-gray-50 p-3 text-sm"
                      >
                        <p className="font-medium text-gray-900">
                          {prescriptionItem.medicineName}
                          {prescriptionItem.strength
                            ? ` — ${prescriptionItem.strength}`
                            : ''}
                        </p>

                        <p className="mt-1 text-gray-600">
                          Dosage: {prescriptionItem.dosage}
                        </p>
                        <p className="text-gray-600">
                          Frequency: {prescriptionItem.frequency}
                        </p>

                        {prescriptionItem.durationDays != null && (
                          <p className="text-gray-600">
                            Duration: {prescriptionItem.durationDays} days
                          </p>
                        )}

                        {prescriptionItem.instructions && (
                          <p className="mt-1 text-gray-600">
                            Instructions: {prescriptionItem.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {prescription.notes && (
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>{' '}
                      {prescription.notes}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
