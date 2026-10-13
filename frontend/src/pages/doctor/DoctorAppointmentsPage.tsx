import { CalendarDays, Clock, RefreshCcw, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDoctorAppointments, updateDoctorAppointmentStatus, type DoctorAppointment } from "../../services/appointment.service";

const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-blue-100 text-blue-700",
};



export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [actionError, setActionError] = useState("");

    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getDoctorAppointments();
            setAppointments(data);
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "Unable to load appointments. Please try again.");
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAppointments();

    }, [loadAppointments]);

    const handleStatusChange = async (
        appointmentId: string,
        status: "CONFIRMED" | "REJECTED" | "COMPLETED"
    ) => {
        try {
            setProcessingId(appointmentId);
            setActionError("");

            const updated = await updateDoctorAppointmentStatus(
                appointmentId,
                status
            );

            setAppointments((current) =>
                current.map((appointment) =>
                    appointment.id === appointmentId ? updated : appointment
                )
            );
        } catch (error: any) {

            setActionError(
                error?.response?.data?.message ??
                "Unable to update the appointment. Please try again."
            );
        }
        finally {
            setProcessingId(null);
        }
    }

    const pendingCount = appointments.filter(
        (appointment) => appointment.status === "PENDING"
    ).length;

    const confirmedCount = appointments.filter(
        (appointment) => appointment.status === "CONFIRMED"
    ).length;

    const completedCount = appointments.filter(
        (appointment) => appointment.status === "COMPLETED"
    ).length;


    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
                Loading Appointments...
            </div>
        )
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                </div>

                <button type="button" onClick={() => void loadAppointments()}
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

            {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {actionError}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Pending" count={pendingCount} />
                <SummaryCard label="Confirmed" count={confirmedCount} />
                <SummaryCard label="Completed" count={completedCount} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-semibold text-slate-900">All Appointments</h2>

                </div>

                {appointments.length === 0 ? (

                    <div className="p-10 text-center">
                        <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />
                        <h3 className="mt-3 font-semibold text-slate-900">No Appointments Yet</h3>
                        <p className="mt-1 text-sm text-slate-500">Patient appointment requests will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.map((appointment) => {
                            const patientName = `${appointment.patientFirstName ?? ""} ${appointment.patientLastName ?? ""}`.trim() || "Patient";

                            const processing = processingId === appointment.id;

                            return (
                                <div key={appointment.id} className="p-5 transition hover:bg-slate-50/50">
                                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <UserRound className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-slate-900">
                                                        {patientName}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        {appointment.patientEmail}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                                    {appointment.appointmentDate}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    {appointment.startTime.slice(0, 5)} –{" "}
                                                    {appointment.endTime.slice(0, 5)}
                                                </span>
                                            </div>


                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Reason:</span>{" "}
                                                {appointment.reason || "Not provided"}
                                            </p>

                                            {appointment.notes && (
                                                <p className="text-sm text-slate-600">
                                                    <span className="font-medium">Notes:</span>{" "}
                                                    {appointment.notes}
                                                </p>
                                            )}

                                        </div>


                                        <div className="flex flex-col items-start gap-3 lg:items-end">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status] ??
                                                    "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {appointment.status}
                                            </span>

                                            {appointment.status === "PENDING" && (
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() =>
                                                            void handleStatusChange(
                                                                appointment.id,
                                                                "CONFIRMED"
                                                            )
                                                        }
                                                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {processing ? "Updating..." : "Confirm"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() =>
                                                            void handleStatusChange(
                                                                appointment.id,
                                                                "REJECTED"
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}


                                            {appointment.status === "CONFIRMED" && (
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() =>
                                                        void handleStatusChange(
                                                            appointment.id,
                                                            "COMPLETED"
                                                        )
                                                    }
                                                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {processing ? "Updating..." : "Mark Completed"}
                                                </button>
                                            )}

                                        </div>

                                    </div>
                                </div>
                            )
                        })}

                    </div>
                )}

            </div>

        </div>
    )
}


function SummaryCard({
    label,
    count
}: {
    label: string;
    count: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">{count}</p>

        </div>
    )
}