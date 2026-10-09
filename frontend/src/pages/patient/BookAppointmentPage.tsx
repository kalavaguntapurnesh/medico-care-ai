
import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    Stethoscope,
    UserRound,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import {
    getApprovedDoctors,
    getDoctorAvailableSlots,
} from "../../services/doctorService";

import type {
    DoctorResponse,
    AvailableSlotResponse,
} from "../../types/doctor";

export default function BookAppointmentPage() {
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedDoctor, setSelectedDoctor] =
        useState<DoctorResponse | null>(null);

    const [selectedDate, setSelectedDate] = useState("");

    const [availableSlots, setAvailableSlots] =
        useState<AvailableSlotResponse[]>([]);

    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    const [selectedSlot, setSelectedSlot] =
        useState<AvailableSlotResponse | null>(null);

    /*
     * Load approved doctors
     */
    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getApprovedDoctors();
                setDoctors(data);
            } catch (error: any) {
                setError(
                    error?.response?.data?.message ??
                    "Unable to load doctors. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDoctors();
    }, []);

    /*
     * Load available slots when
     * doctor + date are selected
     */
    useEffect(() => {
        if (!selectedDoctor || !selectedDate) {
            setAvailableSlots([]);
            setSelectedSlot(null);
            return;
        }

        const loadSlots = async () => {
            try {
                setSlotsLoading(true);
                setSlotsError("");
                setSelectedSlot(null);

                const slots = await getDoctorAvailableSlots(
                    selectedDoctor.id,
                    selectedDate
                );

                setAvailableSlots(slots);
            } catch (error: any) {
                setAvailableSlots([]);

                setSlotsError(
                    error?.response?.data?.message ??
                    "Unable to load available slots. Please try again."
                );
            } finally {
                setSlotsLoading(false);
            }
        };

        loadSlots();
    }, [selectedDoctor, selectedDate]);

    /*
     * Minimum selectable date
     * is tomorrow.
     */
    const getTomorrowDate = () => {
        const tomorrow = new Date();

        tomorrow.setDate(tomorrow.getDate() + 1);

        return tomorrow.toISOString().split("T")[0];
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-slate-500">
                    Loading doctors...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Book an Appointment
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Choose a doctor, select a date and choose an available time slot.
                </p>
            </div>

            {/* General Error */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />

                    <span>{error}</span>
                </div>
            )}

            {/* No doctors */}
            {!error && doctors.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <Stethoscope className="mx-auto h-10 w-10 text-slate-400" />

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        No doctors available
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        There are currently no approved doctors available for booking.
                    </p>
                </div>
            )}

            {/* Step 1 — Select Doctor */}
            {doctors.length > 0 && (
                <section>
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                1
                            </span>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Select a Doctor
                            </h2>
                        </div>

                        <p className="mt-1 ml-9 text-sm text-slate-500">
                            Choose the doctor you would like to consult.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {doctors.map((doctor) => {
                            const isSelected = selectedDoctor?.id === doctor.id;

                            return (
                                <div
                                    key={doctor.id}
                                    className={`rounded-2xl border bg-white p-6 transition ${isSelected
                                        ? "border-blue-500 ring-2 ring-blue-100"
                                        : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                                        }`}
                                >
                                    {/* Doctor identity */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                            <UserRound className="h-6 w-6" />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </h3>

                                            <p className="mt-1 text-sm font-medium text-blue-600">
                                                {doctor.specialization}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Doctor information */}
                                    <div className="mt-5 space-y-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-3">
                                            <Stethoscope className="h-4 w-4 text-slate-400" />

                                            <span>{doctor.qualification}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-slate-400" />

                                            <span>
                                                {doctor.experienceYears} years experience
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CalendarDays className="h-4 w-4 text-slate-400" />

                                            <span>
                                                {doctor.consultationFee !== null
                                                    ? `£${doctor.consultationFee.toFixed(2)} consultation`
                                                    : "Consultation fee not available"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {doctor.bio && (
                                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                                            {doctor.bio}
                                        </p>
                                    )}

                                    {/* Select button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDoctor(doctor);
                                            setSelectedDate("");
                                            setAvailableSlots([]);
                                            setSelectedSlot(null);
                                            setSlotsError("");
                                        }}
                                        className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${isSelected
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            }`}
                                    >
                                        {isSelected ? "Doctor Selected" : "Select Doctor"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Step 2 — Select Date */}
            {selectedDoctor && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                2
                            </span>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Select a Date
                            </h2>
                        </div>

                        <p className="mt-1 ml-9 text-sm text-slate-500">
                            Select a future date for your appointment with Dr.{" "}
                            {selectedDoctor.lastName}.
                        </p>
                    </div>

                    <div className="max-w-md">
                        <label
                            htmlFor="appointment-date"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Appointment Date
                        </label>

                        <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                            <input
                                id="appointment-date"
                                type="date"
                                min={getTomorrowDate()}
                                value={selectedDate}
                                onChange={(event) => {
                                    setSelectedDate(event.target.value);
                                    setSelectedSlot(null);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Step 3 — Available Slots */}
            {selectedDoctor && selectedDate && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                3
                            </span>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Available Time Slots
                            </h2>
                        </div>

                        <p className="mt-1 ml-9 text-sm text-slate-500">
                            Choose a 30-minute appointment slot.
                        </p>
                    </div>

                    {/* Loading */}
                    {slotsLoading && (
                        <div className="flex items-center justify-center py-10">
                            <div className="text-sm text-slate-500">
                                Checking available slots...
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!slotsLoading && slotsError && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle className="h-5 w-5 shrink-0" />

                            <span>{slotsError}</span>
                        </div>
                    )}

                    {/* No slots */}
                    {!slotsLoading &&
                        !slotsError &&
                        availableSlots.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                                <Clock className="mx-auto h-8 w-8 text-slate-400" />

                                <h3 className="mt-3 font-semibold text-slate-800">
                                    No available slots
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    This doctor has no available appointments on the selected
                                    date.
                                </p>
                            </div>
                        )}

                    {/* Slots */}
                    {!slotsLoading && availableSlots.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

                            {availableSlots.map((slot) => {
                                const isSelected =
                                    selectedSlot?.startTime === slot.startTime &&
                                    selectedSlot?.endTime === slot.endTime;

                                return (

                                    <button

                                        key={`${slot.startTime} - ${slot.endTime}`}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`flex min-h-[52px] items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition ${isSelected
                                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                                            }`}

                                    >

                                        <Clock className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="whitespace-nowrap">
                                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                                        </span>

                                    </button>
                                )
                            })}

                        </div>
                    )}

                    {/* Selected slot */}
                    {selectedSlot && (
                        <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                    Selected Time
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {selectedDate} ·{" "}
                                    {selectedSlot.startTime.slice(0, 5)} -{" "}
                                    {selectedSlot.endTime.slice(0, 5)}
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
