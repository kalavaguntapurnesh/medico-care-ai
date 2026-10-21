import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Clock,
    RefreshCcw,
    Search,
    UserRound,
    Users,
    X,
} from "lucide-react";
import {
    getDoctorAppointments,
    type DoctorAppointment,
} from "../../services/appointment.service";

interface PatientSummary {
    patientId: string;
    patientFirstName: string;
    patientLastName: string;
    patientEmail: string;
    appointments: DoctorAppointment[];
}

const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-blue-100 text-blue-700",
};

export default function DoctorPatientsPage() {
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] =
        useState<PatientSummary | null>(null);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getDoctorAppointments();
            setAppointments(data);
        } catch (error: unknown) {
            const message =
                typeof error === "object" &&
                    error !== null &&
                    "response" in error
                    ? (
                        error as {
                            response?: { data?: { message?: string } };
                        }
                    ).response?.data?.message
                    : undefined;

            setError(
                message ?? "Unable to load patients. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAppointments();
    }, [loadAppointments]);

    const patients = useMemo<PatientSummary[]>(() => {
        const patientMap = new Map<string, PatientSummary>();

        for (const appointment of appointments) {
            const patientId = appointment.patientId;

            if (!patientId) continue;

            const existingPatient = patientMap.get(patientId);

            if (existingPatient) {
                existingPatient.appointments.push(appointment);
            } else {
                patientMap.set(patientId, {
                    patientId,
                    patientFirstName: appointment.patientFirstName ?? "",
                    patientLastName: appointment.patientLastName ?? "",
                    patientEmail: appointment.patientEmail ?? "",
                    appointments: [appointment],
                });
            }
        }

        return Array.from(patientMap.values()).sort((a, b) => {
            const aLatest = [...a.appointments].sort((x, y) =>
                `${y.appointmentDate} ${y.startTime}`.localeCompare(
                    `${x.appointmentDate} ${x.startTime}`,
                ),
            )[0];

            const bLatest = [...b.appointments].sort((x, y) =>
                `${y.appointmentDate} ${y.startTime}`.localeCompare(
                    `${x.appointmentDate} ${x.startTime}`,
                ),
            )[0];

            return `${bLatest?.appointmentDate ?? ""} ${bLatest?.startTime ?? ""}`.localeCompare(
                `${aLatest?.appointmentDate ?? ""} ${aLatest?.startTime ?? ""}`,
            );
        });
    }, [appointments]);

    const filteredPatients = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) return patients;

        return patients.filter((patient) => {
            const name =
                `${patient.patientFirstName} ${patient.patientLastName}`.toLowerCase();

            return (
                name.includes(query) ||
                patient.patientEmail.toLowerCase().includes(query)
            );
        });
    }, [patients, searchTerm]);

    const completedAppointments = appointments.filter(
        (appointment) => appointment.status === "COMPLETED",
    ).length;

    const getLatestAppointment = (patient: PatientSummary) =>
        [...patient.appointments].sort((a, b) =>
            `${b.appointmentDate} ${b.startTime}`.localeCompare(
                `${a.appointmentDate} ${a.startTime}`,
            ),
        )[0];

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
                Loading patients...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View patients who have appointments with you.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadAppointments()}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Total Patients"
                    count={patients.length}
                    icon={<Users className="h-5 w-5" />}
                />
                <SummaryCard
                    label="Total Appointments"
                    count={appointments.length}
                    icon={<CalendarDays className="h-5 w-5" />}
                />
                <SummaryCard
                    label="Completed Appointments"
                    count={completedAppointments}
                    icon={<Clock className="h-5 w-5" />}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Patient Directory
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {filteredPatients.length}{" "}
                            {filteredPatients.length === 1 ? "patient" : "patients"} found
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search name or email..."
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {patients.length === 0 ? (
                    <div className="p-10 text-center">
                        <Users className="mx-auto h-10 w-10 text-slate-400" />
                        <h3 className="mt-3 font-semibold text-slate-900">
                            No Patients Yet
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Patients with appointments will appear here.
                        </p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        No patients match your search.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredPatients.map((patient) => {
                            const latest = getLatestAppointment(patient);
                            const patientName =
                                `${patient.patientFirstName} ${patient.patientLastName}`.trim() ||
                                "Patient";

                            return (
                                <div
                                    key={patient.patientId}
                                    className="flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-50/50 sm:flex-row sm:items-center"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                            <UserRound className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900">
                                                {patientName}
                                            </h3>
                                            <p className="break-all text-sm text-slate-500">
                                                {patient.patientEmail || "Email unavailable"}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-600">
                                                {patient.appointments.length}{" "}
                                                {patient.appointments.length === 1
                                                    ? "appointment"
                                                    : "appointments"}
                                            </p>
                                            {latest && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Latest appointment: {latest.appointmentDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedPatient(patient)}
                                        className="shrink-0 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                                    >
                                        View History
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedPatient && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
                    onClick={() => setSelectedPatient(null)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="patient-history-title"
                        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-slate-200 p-5">
                            <div>
                                <h2
                                    id="patient-history-title"
                                    className="text-lg font-bold text-slate-900"
                                >
                                    {`${selectedPatient.patientFirstName} ${selectedPatient.patientLastName}`.trim() ||
                                        "Patient History"}
                                </h2>
                                <p className="mt-1 break-all text-sm text-slate-500">
                                    {selectedPatient.patientEmail}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedPatient(null)}
                                aria-label="Close patient history"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <h3 className="font-semibold text-slate-900">
                                Appointment History
                            </h3>

                            {[...selectedPatient.appointments]
                                .sort((a, b) =>
                                    `${b.appointmentDate} ${b.startTime}`.localeCompare(
                                        `${a.appointmentDate} ${a.startTime}`,
                                    ),
                                )
                                .map((appointment) => (
                                    <article
                                        key={appointment.id}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-medium text-slate-900">
                                                {appointment.appointmentDate}
                                            </p>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status] ??
                                                    "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {appointment.status}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-slate-600">
                                            <Clock className="mr-1 inline h-4 w-4" />
                                            {appointment.startTime.slice(0, 5)} –{" "}
                                            {appointment.endTime.slice(0, 5)}
                                        </p>

                                        <p className="mt-2 text-sm text-slate-600">
                                            <span className="font-medium">Reason:</span>{" "}
                                            {appointment.reason || "Not provided"}
                                        </p>

                                        {appointment.notes && (
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                                                <span className="font-medium">Notes:</span>{" "}
                                                {appointment.notes}
                                            </p>
                                        )}
                                    </article>
                                ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    label,
    count,
    icon,
}: {
    label: string;
    count: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{label}</p>
                <span className="text-blue-600">{icon}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{count}</p>
        </div>
    );
}