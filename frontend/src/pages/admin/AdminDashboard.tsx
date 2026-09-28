export default function AdminDashboard() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage the Medico Care AI platform.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Users"
                    value="0"
                />

                <DashboardCard
                    title="Doctors"
                    value="0"
                />

                <DashboardCard
                    title="Clinics"
                    value="0"
                />

                <DashboardCard
                    title="Audit Logs"
                    value="0"
                />
            </div>
        </div>
    )
}

interface DashboardCardProps {
    title: string
    value: string
}

function DashboardCard({
    title,
    value,
}: DashboardCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
                {title}
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    )
}