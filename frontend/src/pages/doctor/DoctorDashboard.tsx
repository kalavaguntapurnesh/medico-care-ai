import { useCallback, useEffect, useState } from "react"
import { getDoctorAppointments } from "../../services/appointment.service"
import { getMyDoctorPrescriptions } from "../../services/prescription.service"
import { getMyAvailability } from "../../services/doctorAvailability.service"


interface DashboardStats {
  appointments: number,
  patients: number,
  prescriptions: number,
  availability: number

}


interface DashboardCardProps {
  title: string,
  value: string,
  description: string
}


export default function DoctorDashboard() {


  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (refersh = false) => {
    if (refersh) {
      setRefreshing(true);
    }
    else {
      setLoading(true);
    }
    setError('');

    try {
      const [appointmentsResult, prescriptionsResult, availabilityResult] = await Promise.allSettled([
        getDoctorAppointments(),
        getMyDoctorPrescriptions(),
        getMyAvailability()
      ]);

      const appointments = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : null;

      const prescriptions = prescriptionsResult.status === 'fulfilled' ? prescriptionsResult.value : null;

      const availability = availabilityResult.status === 'fulfilled' ? availabilityResult.value : null;

      if (appointments === null && prescriptions === null && availability === null) {
        throw new Error('All dashboard requests failed.');
      }
      setStats((previous) => ({
        appointments: appointments === null ? previous?.appointments ?? 0 : appointments.length,
        patients: appointments === null ? previous?.patients ?? 0 : new Set(appointments.map((item) => item.patientId)).size,
        prescriptions: prescriptions === null ? previous?.prescriptions ?? 0 : prescriptions.length,
        availability: availability === null ? previous?.availability ?? 0 : availability.length
      }));

      if (appointmentsResult.status === 'rejected' || prescriptionsResult.status === 'rejected' || availabilityResult.status === 'rejected') {
        setError(
          'Some information could not be refreshed. Previously loaded values are retained where available.'
        );
      }

    } catch (error) {
      setError('Unable to load dashboard data. Please try again.');
    }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [])

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard])


  const displayValue = (value: number | undefined) => loading && stats === null ? 'Loading...' : String(value ?? '-');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Doctor Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your appointments and patients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard(true)}
          disabled={loading || refreshing}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          title="Appointments"
          value={displayValue(stats?.appointments)}
          description="Total appointments"
        />

        <DashboardCard
          title="Patients"
          value={displayValue(stats?.patients)}
          description="Unique patients in your appointments"
        />

        <DashboardCard
          title="Prescriptions"
          value={displayValue(stats?.prescriptions)}
          description="Prescriptions returned by your API"
        />

        <DashboardCard
          title="Availability"
          value={displayValue(stats?.availability)}
          description="Configured availability entries"
        />
      </div>

      <p className="text-xs text-slate-400">
        Dashboard values are updated when the page loads or you refresh the data.
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
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  )
}