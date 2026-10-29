import { useCallback, useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, RefreshCw, Search, AlertCircle } from "lucide-react";
import type { Clinic } from "../../types/clinic";
import { getClinics } from "../../services/clinic.service";

export default function PatientClinicsPage() {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadClinics = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getClinics();
            setClinics(data.filter((clinic) => clinic.active));
        } catch (err: unknown) {
            const message =
                typeof err === 'object' &&
                    err !== null &&
                    'response' in err &&
                    typeof err.response === 'object' &&
                    err.response !== null &&
                    'data' in err.response &&
                    typeof err.response.data === 'object' &&
                    err.response.data !== null &&
                    'message' in err.response.data &&
                    typeof err.response.data.message === 'string'
                    ? err.response.data.message
                    : 'Unable to load clinics. Please try again.';

            setError(message)
        }
        finally {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        void loadClinics();
    }, [loadClinics])


    const filteredClinics = clinics.filter((clinic) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return [
            clinic.name,
            clinic.addressLine1,
            clinic.addressLine2,
            clinic.city,
            clinic.postCode,
            clinic.phoneNumber,
            clinic.email,
        ].some((value) => value?.toLowerCase().includes(query));
    });


    return (

        <div className="space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Clinics
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Find clinics and their contact information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadClinics()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label
                    htmlFor="clinic-search"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Search clinics
                </label>

                <input
                    id="clinic-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by clinic name, city, postcode or contact..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p>{error}</p>
                    <button type="button" onClick={() => void loadClinics()} className="mt-2 font-semibold underline">
                        Try Again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Loading clinics...
                </div>
            ) : !error && filteredClinics.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    <h2 className="font-semibold text-slate-800">
                        {search ? 'No clinics found' : 'No clinics available'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {search
                            ? 'Try another search term.'
                            : 'There are currently no active clinics to display.'}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-slate-500">
                        {filteredClinics.length}{' '}
                        {filteredClinics.length === 1 ? 'clinic' : 'clinics'} found
                    </p>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredClinics.map((clinic) => {
                            const address = [
                                clinic.addressLine1,
                                clinic.addressLine2,
                                clinic.city,
                                clinic.postCode,
                            ].filter(Boolean).join(', ');

                            return (
                                <article
                                    key={clinic.id}
                                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                            <svg
                                                aria-hidden="true"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-6 w-6"
                                            >
                                                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01" />
                                            </svg>
                                        </div>

                                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                            Active
                                        </span>
                                    </div>

                                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                                        {clinic.name}
                                    </h2>

                                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
                                            <p>{address}</p>
                                        </div>

                                        {clinic.phoneNumber && (
                                            <div className="flex items-start gap-2">
                                                <Phone
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-slate-400"
                                                />
                                                <a
                                                    href={`tel:${clinic.phoneNumber}`}
                                                    className="break-all text-blue-700 hover:underline"
                                                >
                                                    {clinic.phoneNumber}
                                                </a>
                                            </div>
                                        )}


                                        {clinic.email && (
                                            <div className="flex items-start gap-2">
                                                <Mail
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-slate-400"
                                                />
                                                <a
                                                    href={`mailto:${clinic.email}`}
                                                    className="break-all text-blue-700 hover:underline"
                                                >
                                                    {clinic.email}
                                                </a>
                                            </div>
                                        )}



                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}


        </div>
    )


}