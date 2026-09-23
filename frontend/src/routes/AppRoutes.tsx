import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'

import PatientDashboard from '../pages/patient/PatientDashboard'
import DoctorDashboard from '../pages/doctor/DoctorDashboard'
import AdminDashboard from '../pages/admin/AdminDashboard'

import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']} />
                }
            >
                <Route
                    path="/patient"
                    element={<PatientDashboard />}
                />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={['DOCTOR']} />
                }
            >
                <Route
                    path="/doctor"
                    element={<DoctorDashboard />}
                />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']} />
                }
            >
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />
            </Route>

            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    )
}