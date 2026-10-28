import { useCallback, useEffect, useState } from "react"
import { getAllUsers } from "../../services/user.service"
import { getAllDoctorsForAdmin } from "../../services/doctorService"

interface DashboardStats {
    users: number,
    doctors: number,
    pendingDoctors: number,
    approvedDoctors: number,
    rejectedDoctors: number
}


interface DashboardCardProps {
    title: string,
    value: string,
    description?: string
}


export default function AdminDashboard() {


    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadDashboard = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError('');

        try {
            // Load each resource independently so one failed request
            // does not prevent the other resource from loading.
            const [usersResult, doctorsResult] = await Promise.allSettled([
                getAllUsers(),
                getAllDoctorsForAdmin(),
            ]);

            const users =
                usersResult.status === 'fulfilled' ? usersResult.value : null;

            const doctors =
                doctorsResult.status === 'fulfilled' ? doctorsResult.value : null;

            if (users === null && doctors === null) {
                throw new Error('Unable to fetch users and doctors.');
            }

            setStats({
                users: users?.length ?? 0,
                doctors: doctors?.length ?? 0,
                pendingDoctors:
                    doctors?.filter(
                        (doctor) =>
                            doctor.approvalStatus?.toUpperCase() === 'PENDING'
                    ).length ?? 0,
                approvedDoctors:
                    doctors?.filter(
                        (doctor) =>
                            doctor.approvalStatus?.toUpperCase() === 'APPROVED'
                    ).length ?? 0,
                rejectedDoctors:
                    doctors?.filter(
                        (doctor) =>
                            doctor.approvalStatus?.toUpperCase() === 'REJECTED'
                    ).length ?? 0,
            });

            if (usersResult.status === 'rejected' ||
                doctorsResult.status === 'rejected') {
                setError(
                    'Some dashboard data could not be loaded. Check your connection and permissions.'
                );
            }
        } catch {
            setError('Unable to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard])


    const displayValue = (value: number | undefined) => loading && stats === null ? '-' : String(value ?? '-');

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Monitor and manage the Medico Care AI platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadDashboard(true)}
                    disabled={loading || refreshing}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh data'}
                </button>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Users"
                    value={loading && !stats ? 'Loading...' : displayValue(stats?.users)}
                    description="Registered platform users"
                />

                <DashboardCard
                    title="Doctors"
                    value={loading && !stats ? 'Loading...' : displayValue(stats?.doctors)}
                    description="All registered doctor profiles"
                />

                <DashboardCard
                    title="Clinics"
                    value="Not connected"
                    description="Clinic API not configured"
                />

                <DashboardCard
                    title="Audit Logs"
                    value="Not connected"
                    description="Audit log API not configured"
                />
            </div>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Doctor Approval Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Current approval status of registered doctors.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <DashboardCard
                        title="Pending Approval"
                        value={loading && !stats ? 'Loading...' : displayValue(stats?.pendingDoctors)}
                        description="Awaiting admin review"
                    />

                    <DashboardCard
                        title="Approved Doctors"
                        value={loading && !stats ? 'Loading...' : displayValue(stats?.approvedDoctors)}
                        description="Approved to provide services"
                    />

                    <DashboardCard
                        title="Rejected Doctors"
                        value={loading && !stats ? 'Loading...' : displayValue(stats?.rejectedDoctors)}
                        description="Applications rejected"
                    />
                </div>
            </section>

            <p className="text-xs text-slate-400">
                Counts reflect the latest successful API response. Select Refresh data
                to fetch updated counts.
            </p>
        </div>
    )
}



function DashboardCard({
    title,
    value,
    description
}: DashboardCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <p className="mt-3 break-words text-2xl font-bold text-slate-900">
                {value}
            </p>

            {description && (
                <p className="mt-2 text-xs text-slate-500">{description}</p>
            )}
        </div>
    )
}