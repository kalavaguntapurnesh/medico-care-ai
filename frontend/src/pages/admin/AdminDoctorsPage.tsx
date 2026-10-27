
import { useEffect, useMemo, useState } from 'react';
import { getAllDoctorsForAdmin } from '../../services/doctorService';
import type { DoctorResponse } from '../../types/doctor';

export default function AdminDoctorsPage() {
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadDoctors() {
            try {
                setLoading(true);
                setError('');

                const result = await getAllDoctorsForAdmin();

                if (!cancelled) {
                    setDoctors(result);
                }
            } catch {
                if (!cancelled) {
                    setError(
                        'Unable to fetch doctors. Please check your login and API connection.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadDoctors();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredDoctors = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return doctors;

        return doctors.filter((doctor) =>
            [
                doctor.firstName,
                doctor.lastName,
                doctor.email,
                doctor.specialization,
                doctor.qualification,
                doctor.licenseNumber ?? '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(query)
        );
    }, [doctors, search]);

    return (
        <main className="space-y-6 p-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">
                    Doctors Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    View and search approved doctors registered on MediMind AI.
                </p>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">Approved doctors loaded</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {loading ? '—' : doctors.length}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">Matching doctors</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {loading ? '—' : filteredDoctors.length}
                    </p>
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
                <label
                    htmlFor="doctor-search"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Search doctors
                </label>

                <input
                    id="doctor-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Name, email, specialisation or licence number..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
            </section>

            {loading && (
                <p className="text-sm text-gray-500">Loading doctors...</p>
            )}

            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="ml-3 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-3 font-medium">Doctor</th>
                                <th className="px-5 py-3 font-medium">Specialisation</th>
                                <th className="px-5 py-3 font-medium">Qualification</th>
                                <th className="px-5 py-3 font-medium">Experience</th>
                                <th className="px-5 py-3 font-medium">Consultation fee</th>
                                <th className="px-5 py-3 font-medium">Approval</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredDoctors.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-gray-900">
                                            {doctor.firstName} {doctor.lastName}
                                        </p>
                                        <p className="mt-1 text-gray-500">{doctor.email}</p>
                                    </td>

                                    <td className="px-5 py-4 text-gray-700">
                                        {doctor.specialization}
                                    </td>

                                    <td className="px-5 py-4 text-gray-700">
                                        {doctor.qualification}
                                    </td>

                                    <td className="px-5 py-4 text-gray-700">
                                        {doctor.experienceYears} years
                                    </td>

                                    <td className="px-5 py-4 text-gray-700">
                                        {doctor.consultationFee == null
                                            ? 'Not set'
                                            : doctor.consultationFee.toLocaleString('en-GB', {
                                                style: 'currency',
                                                currency: 'GBP',
                                            })}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                            {doctor.approvalStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {filteredDoctors.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-gray-500"
                                    >
                                        No matching doctors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            )}
        </main>
    );
}
