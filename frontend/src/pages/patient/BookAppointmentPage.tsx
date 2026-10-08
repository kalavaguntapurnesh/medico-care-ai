import { useEffect, useState } from "react";

import { CalendarDays, Clock, Stethoscope, UserRound, AlertCircle } from "lucide-react";

import { getApprovedDoctors } from "../../services/doctorService";

import type { DoctorResponse } from "../../types/doctor";

export default function BookAppointmentPage() {
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getApprovedDoctors();
                setDoctors(data);
            } catch (error: any) {

                setError(
                    error?.response?.data?.message ?? "Unable to load doctors. Please try again."
                );
            }
            finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-sm text-slate-500">
                    Loading Doctors...

                </div>

            </div>
        )
    }

    return (

        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-900">Book an Appointment</h1>

                <p className="mt-1 text-sm text-slate-500">Choose a doctor to continue with your appointment.</p>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

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

            {doctors.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {doctors.map((doctor) => {
                        const isSelected = selectedDoctor?.id === doctor.id;

                        return (
                            <div key={doctor.id}
                                className={`rounded-2xl border bg-white p-6 transition ${isSelected
                                    ? "border-blue-500 ring-2 ring-blue-100"
                                    : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                                    }`}
                            >

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                        <UserRound className="h-6 w-6" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-slate-900">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </h2>

                                        <p className="mt-1 text-sm font-medium text-blue-600">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                </div>


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

                                {doctor.bio && (
                                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                                        {doctor.bio}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${isSelected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        }`}
                                >
                                    {isSelected ? "Doctor Selected" : "Select Doctor"}
                                </button>


                            </div>
                        );
                    })}
                </div>
            )}


            {selectedDoctor && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Selected Doctor
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>

                    <p className="text-sm text-slate-600">
                        {selectedDoctor.specialization}
                    </p>

                </div>
            )}

        </div>
    )


}