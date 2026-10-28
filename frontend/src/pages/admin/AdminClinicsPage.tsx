
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createClinin,
  deactivateClinic,
  getClinics,
  updateClinic,
} from '../../services/clinic.service';
import type { Clinic, ClinicRequest } from '../../types/clinic';

const EMPTY_FORM: ClinicRequest = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postCode: '',
  phoneNumber: '',
  email: '',
};

function errorMessage(error: unknown): string {
  const apiError = error as {
    response?: { data?: { message?: string; error?: string } };
  };

  return (
    apiError.response?.data?.message ??
    apiError.response?.data?.error ??
    'Something went wrong. Please try again.'
  );
}

function optionalValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [form, setForm] = useState<ClinicRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [clinicToDeactivate, setClinicToDeactivate] =
    useState<Clinic | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadClinics = useCallback(async (manualRefresh = false) => {
    if (manualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPageError('');

    try {
      const data = await getClinics();
      setClinics(data);
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadClinics();
  }, [loadClinics]);

  const filteredClinics = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clinics;

    return clinics.filter((clinic) =>
      [
        clinic.name,
        clinic.addressLine1,
        clinic.addressLine2 ?? '',
        clinic.city,
        clinic.postCode ?? '',
        clinic.phoneNumber ?? '',
        clinic.email ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [clinics, search]);

  function openCreateForm() {
    setEditingClinic(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setFormOpen(true);
  }

  function openEditForm(clinic: Clinic) {
    setEditingClinic(clinic);
    setForm({
      name: clinic.name,
      addressLine1: clinic.addressLine1,
      addressLine2: clinic.addressLine2 ?? '',
      city: clinic.city,
      postCode: clinic.postCode ?? '',
      phoneNumber: clinic.phoneNumber ?? '',
      email: clinic.email ?? '',
    });
    setFormError('');
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingClinic(null);
    setFormError('');
  }

  function updateField(
    field: keyof ClinicRequest,
    value: string
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const request: ClinicRequest = {
      name: form.name.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: optionalValue(form.addressLine2),
      city: form.city.trim(),
      postCode: optionalValue(form.postCode),
      phoneNumber: optionalValue(form.phoneNumber),
      email: optionalValue(form.email),
    };

    if (!request.name || !request.addressLine1 || !request.city) {
      setFormError('Clinic name, address line 1, and city are required.');
      return;
    }

    setSaving(true);

    try {
      if (editingClinic) {
        await updateClinic(editingClinic.id, request);
        setSuccessMessage('Clinic updated successfully.');
      } else {
        await createClinin(request);
        setSuccessMessage('Clinic created successfully.');
      }

      setFormOpen(false);
      setEditingClinic(null);
      await loadClinics();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!clinicToDeactivate) return;

    setDeactivating(true);
    setPageError('');
    setSuccessMessage('');

    try {
      await deactivateClinic(clinicToDeactivate.id);

      setClinics((current) =>
        current.filter((clinic) => clinic.id !== clinicToDeactivate.id)
      );

      setSuccessMessage(
        `${clinicToDeactivate.name} has been deactivated.`
      );
      setClinicToDeactivate(null);
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Clinics Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, search, update and deactivate clinics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadClinics(true)}
            disabled={loading || refreshing}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add clinic
          </button>
        </div>
      </header>

      {pageError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {pageError}
          <button
            type="button"
            onClick={() => void loadClinics(true)}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active clinics loaded</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? '—' : clinics.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Matching search results</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? '—' : filteredClinics.length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
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
          placeholder="Name, city, postCode, phone or email..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </section>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading clinics...
        </div>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Clinic</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredClinics.map((clinic) => (
                <tr key={clinic.id} className="align-top hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {clinic.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Added {new Date(clinic.createdAt).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <p>{clinic.addressLine1}</p>
                    {clinic.addressLine2 && <p>{clinic.addressLine2}</p>}
                    <p>
                      {clinic.city}
                      {clinic.postCode ? `, ${clinic.postCode}` : ''}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <p>{clinic.email || 'No email'}</p>
                    <p className="mt-1">{clinic.phoneNumber || 'No phone'}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(clinic)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setClinicToDeactivate(clinic)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClinics.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    {clinics.length === 0
                      ? 'No active clinics found. Add your first clinic to get started.'
                      : 'No clinics match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="clinic-form-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="clinic-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingClinic ? 'Edit clinic' : 'Add clinic'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the clinic's contact and address details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Clinic name" required>
                  <input
                    required
                    maxLength={255}
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className={inputClass}
                    placeholder="e.g. Central Medical Clinic"
                  />
                </FormField>

                <FormField label="City" required>
                  <input
                    required
                    maxLength={100}
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    className={inputClass}
                    placeholder="City"
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Address line 1" required>
                    <input
                      required
                      maxLength={255}
                      value={form.addressLine1}
                      onChange={(event) =>
                        updateField('addressLine1', event.target.value)
                      }
                      className={inputClass}
                      placeholder="Street address"
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Address line 2">
                    <input
                      maxLength={255}
                      value={form.addressLine2 ?? ''}
                      onChange={(event) =>
                        updateField('addressLine2', event.target.value)
                      }
                      className={inputClass}
                      placeholder="Building, suite or area (optional)"
                    />
                  </FormField>
                </div>

                <FormField label="postCode">
                  <input
                    maxLength={30}
                    value={form.postCode ?? ''}
                    onChange={(event) =>
                      updateField('postCode', event.target.value)
                    }
                    className={inputClass}
                    placeholder="postCode"
                  />
                </FormField>

                <FormField label="Phone number">
                  <input
                    type="tel"
                    maxLength={30}
                    value={form.phoneNumber ?? ''}
                    onChange={(event) =>
                      updateField('phoneNumber', event.target.value)
                    }
                    className={inputClass}
                    placeholder="Contact number"
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Email address">
                    <input
                      type="email"
                      maxLength={255}
                      value={form.email ?? ''}
                      onChange={(event) =>
                        updateField('email', event.target.value)
                      }
                      className={inputClass}
                      placeholder="clinic@example.com"
                    />
                  </FormField>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingClinic
                      ? 'Save changes'
                      : 'Create clinic'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {clinicToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deactivate-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="deactivate-title"
              className="text-lg font-bold text-slate-900"
            >
              Deactivate clinic?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to deactivate{' '}
              <strong>{clinicToDeactivate.name}</strong>? It will no longer
              appear in the active clinic list.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              This action updates the clinic's status; it does not permanently
              delete the record.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setClinicToDeactivate(null)}
                disabled={deactivating}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDeactivate()}
                disabled={deactivating}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deactivating ? 'Deactivating...' : 'Confirm deactivation'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}
