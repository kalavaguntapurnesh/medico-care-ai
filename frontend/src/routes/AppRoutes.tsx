import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'

import DoctorAppointmentsPage from '../pages/doctor/DoctorAppointmentsPage'
import PatientDashboard from '../pages/patient/PatientDashboard'
import DoctorDashboard from '../pages/doctor/DoctorDashboard'
import AdminDashboard from '../pages/admin/AdminDashboard'
import PatientAppointmentsPage from '../pages/patient/PatientAppointmentsPage'
import DashboardLayout from '../layouts/DashboardLayout'
import BookAppointmentPage from '../pages/patient/BookAppointmentPage'
import ProtectedRoute from './ProtectedRoute'
import DoctorPatientsPage from '../pages/doctor/DoctorPatientsPage'
import PatientPrescriptionsPage from '../pages/patient/PatientPrescriptionsPage'
import DoctorPrescriptionsPage from '../pages/doctor/DoctorPrescriptionsPage'
import PatientRemindersPage from '../pages/patient/PatientRemindersPage'
import NotificationCenterPage from '../pages/shared/NotificationCenterPage'
import DoctorAvailabilityPage from '../pages/doctor/DoctorAvailabilityPage'
import PatientMedicalRecordsPage from '../pages/patient/PatientMedicalRecordsPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Authentication */}
            <Route
                path="/login"
                element={<LoginPage />}
            />

            {/* Patient */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']} />
                }
            >
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/patient"
                        element={<PatientDashboard />}
                    />

                    <Route
                        path="/patient/appointments"
                        element={<PatientAppointmentsPage />}
                    />

                    <Route
                        path="/patient/medical-records"
                        element={
                            <PatientMedicalRecordsPage />
                        }
                    />

                    <Route
                        path="/patient/book-appointment"
                        element={<BookAppointmentPage />}

                    />

                    <Route
                        path="/patient/prescriptions"
                        element={
                            <PatientPrescriptionsPage />
                        }
                    />

                    <Route
                        path="/patient/reminders"
                        element={
                            <PatientRemindersPage />
                        }
                    />

                    <Route
                        path="/patient/notifications"
                        element={
                            <NotificationCenterPage />
                        }
                    />

                    <Route
                        path="/patient/clinics"
                        element={
                            <PlaceholderPage title="Clinics" />
                        }
                    />
                </Route>
            </Route>

            {/* Doctor */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['DOCTOR']} />
                }
            >
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/doctor"
                        element={<DoctorDashboard />}
                    />

                    <Route
                        path="/doctor/appointments"
                        element={
                            <DoctorAppointmentsPage />
                        }
                    />

                    <Route
                        path="/doctor/patients"
                        element={
                            <DoctorPatientsPage />
                        }
                    />

                    <Route
                        path="/doctor/prescriptions"
                        element={
                            <DoctorPrescriptionsPage />
                        }
                    />

                    <Route
                        path="/doctor/availability"
                        element={
                            <DoctorAvailabilityPage />
                        }
                    />

                    <Route
                        path="/doctor/notifications"
                        element={
                            <NotificationCenterPage />
                        }
                    />
                </Route>
            </Route>

            {/* Admin */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']} />
                }
            >
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <AdminUsersPage />
                        }
                    />

                    <Route
                        path="/admin/doctors"
                        element={
                            <AdminDoctorsPage />
                        }
                    />

                    <Route
                        path="/admin/clinics"
                        element={
                            <PlaceholderPage title="Clinics" />
                        }
                    />

                    <Route
                        path="/admin/audit-logs"
                        element={
                            <PlaceholderPage title="Audit Logs" />
                        }
                    />
                </Route>
            </Route>

            {/* Fallback */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />
        </Routes>
    )
}

interface PlaceholderPageProps {
    title: string
}

function PlaceholderPage({
    title,
}: PlaceholderPageProps) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">
                {title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                This module will be implemented next.
            </p>
        </div>
    )
}