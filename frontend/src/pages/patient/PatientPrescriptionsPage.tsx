import { useCallback, useEffect, useState } from "react";

import type { Prescription } from "../../types/prescription";

import { getMyPatientPrescription, getMyPatientPrescriptions } from "../../services/prescription.service";

import { jsPDF } from "jspdf"

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response

    if (response?.data?.message) return response.data.message;

  }

  if (error instanceof Error) return error.message;
  return 'Unable to complte the request. Please try again.';
}

const addWrappedText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 6,
) => {
  const lines = pdf.splitTextToSize(text, maxWidth) as string[];
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (const line of lines) {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

const downloadPrescriptionPdf = (prescription: Prescription) => {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();

  const margin = 18;

  const contentWidth = pageWidth - margin * 2;

  let y = 22;

  pdf.setFont('helvetica', 'bold');

  pdf.setFontSize(20);
  pdf.text('PRESCRIPTION RECORD', margin, y);
  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Generated from Medimind AI', margin, y);
  y += 10;

  pdf.setDrawColor(210, 210, 210);
  pdf.line(margin, y, pageWidth - margin, y);

  y += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Prescription information', margin, y);
  y += 8;

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)

  const details = [
    `Prescription ID: ${prescription.id}`,
    `Prescription date: ${prescription.prescriptionDate}`,
    `Status: ${prescription.status}`,
    `Appointment ID: ${prescription.appointmentId}`,
  ]

  for (const detail of details) {
    y = addWrappedText(pdf, detail, margin, y, contentWidth);
  }
  y += 5;

  pdf.setFont('helvetica', 'bold');

  pdf.text('Prescribed medicines', margin, y);

  y += 8;

  prescription.items.forEach((item, index) => {
    if (y > pdf.internal.pageSize.getHeight() - 35) {
      pdf.addPage()
      y = 20
    }

    pdf.setFont('helvetica', 'bold')
    y = addWrappedText(
      pdf,
      `${index + 1}. ${item.medicineName}${item.strength ? ` (${item.strength})` : ''}`,
      margin,
      y,
      contentWidth,
    )

    pdf.setFont('helvetica', 'normal')

    const medicineDetails = [
      `Form: ${item.form || 'Not specified'}`,
      `Dosage: ${item.dosage}`,
      `Frequency: ${item.frequency}`,
      `Duration: ${item.durationDays != null ? `${item.durationDays} days` : 'Not specified'}`,
      `Instructions: ${item.instructions || 'None provided'}`,
    ]

    for (const detail of medicineDetails) {
      y = addWrappedText(pdf, detail, margin + 4, y, contentWidth - 4)
    }

    y += 4
  })

  if (prescription.notes?.trim()) {
    y += 2
    pdf.setFont('helvetica', 'bold')
    y = addWrappedText(pdf, 'Prescription notes', margin, y, contentWidth)
    pdf.setFont('helvetica', 'normal')
    y = addWrappedText(
      pdf,
      prescription.notes,
      margin,
      y,
      contentWidth,
    )
  }

  y += 8;

  pdf.setFontSize(8);

  pdf.setTextColor(100, 100, 100)
  addWrappedText(
    pdf,
    'This document reproduces the prescription information available in the application. It does not independently verify clinical authorisation or replace a formally signed prescription where one is required.',
    margin,
    y,
    contentWidth,
    4,
  )

  const safeId = prescription.id.slice(0, 8);
  pdf.save(`MediMind-Prescription-${safeId}.pdf`)


}


export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyPatientPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      setError(getErrorMessage(error));
    }
    finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    void loadPrescriptions();
  }, [loadPrescriptions])

  const openPrescription = async (id: string) => {
    setError('');
    setDetailLoading(true);
    try {
      const prescription = await getMyPatientPrescription(id);
      setSelected(prescription);
    } catch (error) {
      setError(getErrorMessage(error));
    }
    finally {
      setDetailLoading(false);
    }
  }

  const handlePrint = () => {
    if (!selected) return;
    downloadPrescriptionPdf(selected);

  }

  if (loading) {
    return <div className="p-6 text-gray-600">
      Loading your prescriptions...
    </div>
  }


  return (

    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="mt-1 text-sm text-gray-500">View and download prescriptions issued to you.</p>
      </header>


      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {detailLoading && (
        <p className="text-sm text-gray-500">
          Loading prescription details...
        </p>
      )}

      {!selected && prescriptions.length === 0 && !error && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">No prescriptions yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your prescriptions will appear here when your doctor issues them.
          </p>
        </div>
      )}

      {!selected && prescriptions.length > 0 && (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <article
              key={prescription.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="font-semibold text-gray-900">
                  <h2>Prescrption Dated : {prescription.prescriptionDate}</h2>
                  <p className="mt-1 text-sm text-gray-500">{prescription.items.length} medicine(s)</p>
                  <p className="mt-1 text-xs text-gray-400">Reference : {prescription.id.slice(0, 8)}</p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {prescription.status}</span>

              </div>

              <div className="mt-2">
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  type="button" onClick={() => void openPrescription(prescription.id)}>
                  View Details
                </button>

                <button type="button" disabled={detailLoading} onClick={() => void openPrescription(prescription.id)}
                  className="rounded-lg ml-4 border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  title="Open the prescription details before downloading">
                  Prepare PDF
                </button>
              </div>

            </article>
          ))}
        </div>
      )}

      {selected && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mb-5 text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to prescriptions
          </button>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Prescription details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Date: {selected.prescriptionDate}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {selected.status}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {selected.items.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="font-semibold text-gray-900">
                  {item.medicineName}
                  {item.strength ? ` — ${item.strength}` : ''}
                </h3>

                {item.genericName && (
                  <p className="mt-1 text-sm text-gray-500">
                    Generic name: {item.genericName}
                  </p>
                )}

                <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Dosage</dt>
                    <dd className="font-medium text-gray-900">{item.dosage}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Frequency</dt>
                    <dd className="font-medium text-gray-900">{item.frequency}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Duration</dt>
                    <dd className="font-medium text-gray-900">
                      {item.durationDays != null
                        ? `${item.durationDays} days`
                        : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Form</dt>
                    <dd className="font-medium text-gray-900">
                      {item.form || 'Not specified'}
                    </dd>
                  </div>
                </dl>

                {item.instructions && (
                  <p className="mt-3 text-sm text-gray-700">
                    <span className="font-medium">Instructions:</span>{' '}
                    {item.instructions}
                  </p>
                )}
              </article>
            ))}
          </div>

          {selected.notes && (
            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {selected.notes}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadPrescriptionPdf(selected)}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Download PDF
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Download for printing
            </button>
          </div>
        </section>
      )}

    </div>
  )
}