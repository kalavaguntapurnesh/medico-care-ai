import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import {
    createMedicalRecord,
    deleteMedicalRecord,
    downloadMedicalRecord,
    getMyMedicalRecords,
} from '../../services/medicalRecord.service';

import type { MedicalRecord } from '../../types/medicalRecord';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.doc',
    '.docx',
];

const ACCEPTED_FILE_TYPES = ALLOWED_EXTENSIONS.join(',');

const RECORD_TYPES = [
    'Lab Report',
    'Prescription',
    'Medical Imaging',
    'Discharge Summary',
    'Consultation Report',
    'Vaccination Record',
    'Other',
];

const INITIAL_FORM = {
    title: '',
    recordType: 'Lab Report',
    description: '',
    recordDate: '',
};

function formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return 'Unknown size';
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return 'Not specified';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function getErrorMessage(error: unknown): string {
    const axiosError = error as {
        response?: {
            data?: unknown;
        };
        message?: string;
    };

    const responseData = axiosError.response?.data;

    if (
        responseData &&
        typeof responseData === 'object' &&
        'message' in responseData &&
        typeof responseData.message === 'string'
    ) {
        return responseData.message;
    }

    if (axiosError.message) {
        return axiosError.message;
    }

    return 'Something went wrong. Please try again.';
}

function getFileExtension(fileName: string): string {
    const index = fileName.lastIndexOf('.');
    return index >= 0 ? fileName.slice(index).toLowerCase() : '';
}

function isAllowedFile(file: File): boolean {
    return ALLOWED_EXTENSIONS.includes(getFileExtension(file.name));
}

function getRecordIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return 'IMG';
    if (mimeType.includes('word')) return 'DOC';

    return 'FILE';
}

export default function PatientMedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);

    const [form, setForm] = useState(INITIAL_FORM);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function loadRecords() {
        setLoading(true);
        setError('');

        try {
            const data = await getMyMedicalRecords();

            setRecords(
                data
                    .filter((record) => !record.deletedAt)
                    .sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return dateB - dateA;
                    }),
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadRecords();
    }, []);

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return records;

        return records.filter((record) =>
            [
                record.title,
                record.recordType,
                record.fileName,
                record.description ?? '',
            ].some((value) => value.toLowerCase().includes(query)),
        );
    }, [records, search]);

    const totalStorage = useMemo(
        () => records.reduce((total, record) => total + record.fileSize, 0),
        [records],
    );

    function resetUploadForm() {
        setForm(INITIAL_FORM);
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function handleFileChange(file: File | null) {
        setError('');
        setSuccess('');

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!isAllowedFile(file)) {
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setError(
                `Unsupported file type. Choose one of: ${ALLOWED_EXTENSIONS.join(', ')}.`,
            );

            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setError('The file exceeds the 10 MB upload limit.');

            return;
        }

        setSelectedFile(file);
    }

    async function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!form.title.trim()) {
            setError('Please enter a title for this medical record.');
            return;
        }

        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setUploading(true);

        try {
            await createMedicalRecord(
                {
                    title: form.title.trim(),
                    recordType: form.recordType,
                    description: form.description.trim(),
                    recordDate: form.recordDate || undefined,
                },
                selectedFile,
            );

            resetUploadForm();
            setShowUploadForm(false);
            setSuccess('Your medical record has been uploaded successfully.');

            await loadRecords();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    }

    async function handleDownload(record: MedicalRecord) {
        setError('');
        setSuccess('');
        setDownloadingId(record.id);

        try {
            const blob = await downloadMedicalRecord(record.id);

            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');

            anchor.href = objectUrl;
            anchor.download = record.fileName || `${record.title}.file`;

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDownloadingId(null);
        }
    }

    async function handleDelete(record: MedicalRecord) {
        const confirmed = window.confirm(
            `Delete "${record.title}"?\n\nThis record will no longer appear in your active medical records.`,
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');
        setDeletingId(record.id);

        try {
            await deleteMedicalRecord(record.id);

            setRecords((current) =>
                current.filter((item) => item.id !== record.id),
            );

            setSuccess(`"${record.title}" was deleted successfully.`);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Page heading */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-blue-600">
                        Patient Portal
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Medical Records
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        Keep your reports, prescriptions, and other medical documents
                        together in one secure place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setShowUploadForm((current) => !current);
                        setError('');
                        setSuccess('');
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {showUploadForm ? 'Close upload form' : '+ Upload record'}
                </button>
            </section>

            {/* Feedback */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError('')}
                        aria-label="Dismiss error"
                        className="font-semibold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                >
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() => setSuccess('')}
                        aria-label="Dismiss success message"
                        className="font-semibold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Summary */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Active records
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {records.length}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Available in your medical records library
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Total file size
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {formatFileSize(totalStorage)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Combined size of your active records
                    </p>
                </div>
            </section>

            {/* Upload form */}
            {showUploadForm && (
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Upload a medical record
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Add the document details and select the file you want to store.
                        </p>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="record-title"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Record title <span className="text-red-500">*</span>
                                </label>

                                <input
                                    id="record-title"
                                    type="text"
                                    required
                                    maxLength={255}
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Blood test results"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="record-type"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Record type <span className="text-red-500">*</span>
                                </label>

                                <select
                                    id="record-type"
                                    required
                                    value={form.recordType}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            recordType: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {RECORD_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="record-date"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Date of record
                                </label>

                                <input
                                    id="record-date"
                                    type="date"
                                    value={form.recordDate}
                                    max={new Date().toISOString().slice(0, 10)}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            recordDate: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="record-description"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>

                                <input
                                    id="record-description"
                                    type="text"
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Optional notes"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="record-file"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Select document <span className="text-red-500">*</span>
                            </label>

                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 transition hover:border-blue-400">
                                <input
                                    ref={fileInputRef}
                                    id="record-file"
                                    type="file"
                                    required
                                    accept={ACCEPTED_FILE_TYPES}
                                    onChange={(event) =>
                                        handleFileChange(event.target.files?.[0] ?? null)
                                    }
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                                />

                                <p className="mt-3 text-xs leading-5 text-gray-500">
                                    Supported extensions in this UI: PDF, PNG, JPG, JPEG,
                                    DOC and DOCX. Maximum file size: 10 MB.
                                </p>

                                {selectedFile && (
                                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => {
                                    resetUploadForm();
                                    setShowUploadForm(false);
                                }}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploading ? 'Uploading…' : 'Upload record'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Records */}
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Your documents
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Browse, download or remove a record.
                        </p>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <label htmlFor="record-search" className="sr-only">
                            Search medical records
                        </label>

                        <input
                            id="record-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search records…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-gray-500">
                            Loading your medical records…
                        </p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="p-10 text-center sm:p-14">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600">
                            +
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-gray-900">
                            {search ? 'No matching records' : 'No medical records yet'}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                            {search
                                ? 'Try a different search term.'
                                : 'Upload your first report or medical document to keep it accessible in your patient portal.'}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                onClick={() => setShowUploadForm(true)}
                                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Upload your first record
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Document</th>
                                        <th className="px-5 py-4 font-semibold">Type</th>
                                        <th className="px-5 py-4 font-semibold">Record date</th>
                                        <th className="px-5 py-4 font-semibold">File size</th>
                                        <th className="px-5 py-4 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <div className="flex min-w-56 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                                                        {getRecordIcon(record.mimeType)}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-gray-900">
                                                            {record.title}
                                                        </p>

                                                        <p className="mt-1 max-w-64 truncate text-xs text-gray-500">
                                                            {record.fileName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {record.recordType}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                {formatDate(record.recordDate)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                {formatFileSize(record.fileSize)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            downloadingId === record.id ||
                                                            deletingId === record.id
                                                        }
                                                        onClick={() => void handleDownload(record)}
                                                        className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        {downloadingId === record.id
                                                            ? 'Downloading…'
                                                            : 'Download'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deletingId === record.id ||
                                                            downloadingId === record.id
                                                        }
                                                        onClick={() => void handleDelete(record)}
                                                        className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {deletingId === record.id
                                                            ? 'Deleting…'
                                                            : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="divide-y divide-gray-100 md:hidden">
                            {filteredRecords.map((record) => (
                                <article key={record.id} className="space-y-4 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                                            {getRecordIcon(record.mimeType)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="break-words font-semibold text-gray-900">
                                                {record.title}
                                            </h3>

                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {record.fileName}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-500">
                                                {record.recordType} · {formatFileSize(record.fileSize)}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Record date: {formatDate(record.recordDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {record.description && (
                                        <p className="text-sm text-gray-600">
                                            {record.description}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                downloadingId === record.id ||
                                                deletingId === record.id
                                            }
                                            onClick={() => void handleDownload(record)}
                                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            {downloadingId === record.id
                                                ? 'Downloading…'
                                                : 'Download'}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                deletingId === record.id ||
                                                downloadingId === record.id
                                            }
                                            onClick={() => void handleDelete(record)}
                                            className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {deletingId === record.id ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {!loading && filteredRecords.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-500">
                        Showing {filteredRecords.length} of {records.length} records
                    </div>
                )}
            </section>

            <p className="text-xs leading-5 text-gray-500">
                Medical documents contain sensitive information. Upload only documents
                you intend to store in your patient account. The backend remains
                responsible for enforcing file security, access permissions and upload
                limits.
            </p>
        </main>
    );
}