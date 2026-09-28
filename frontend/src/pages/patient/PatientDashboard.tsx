export default function PatientDashboard() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Patient Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Overview of your healthcare activity.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Appointments"
                    value="0"
                />

                <DashboardCard
                    title="Medical Records"
                    value="0"
                />

                <DashboardCard
                    title="Prescriptions"
                    value="0"
                />

                <DashboardCard
                    title="Reminders"
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