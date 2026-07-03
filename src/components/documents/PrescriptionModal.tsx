"use client";

// ============================================================
// PRESCRIPTION MODAL — components/documents/PrescriptionModal.tsx
// ============================================================
//
// Formulaire de rédaction d'une ordonnance par le médecin.
// Liste dynamique de médicaments + remarques. À la validation,
// crée le doc "prescriptions" (voir src/lib/documents.ts).
// ============================================================

import { useState } from "react";
import { createPrescription } from "@/lib/documents";
import { Medication } from "@/types/document";

type Props = {
  doctorId: string;
  doctorName: string;
  specialty?: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  onClose: () => void;
  onDone?: (prescriptionId: string) => void;
};

const emptyMed = (): Medication => ({
  name: "",
  dosage: "",
  duration: "",
  instructions: "",
});

export default function PrescriptionModal({
  doctorId,
  doctorName,
  specialty,
  patientId,
  patientName,
  appointmentId,
  onClose,
  onDone,
}: Props) {
  const [meds, setMeds] = useState<Medication[]>([emptyMed()]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateMed = (i: number, field: keyof Medication, value: string) => {
    setMeds((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)),
    );
  };

  const addMed = () => setMeds((prev) => [...prev, emptyMed()]);
  const removeMed = (i: number) =>
    setMeds((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const cleaned = meds
      .map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        duration: m.duration.trim(),
        instructions: m.instructions?.trim() || "",
      }))
      .filter((m) => m.name);

    if (cleaned.length === 0) {
      setError("Ajoutez au moins un médicament.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const id = await createPrescription({
        doctorId,
        doctorName,
        specialty,
        patientId,
        patientName,
        appointmentId,
        medications: cleaned,
        notes,
      });
      onDone?.(id);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* En-tête */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Rédiger une ordonnance</h2>
            <p className="text-xs text-gray-400">Pour {patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-4">
          {meds.map((m, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-xl p-3 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  Médicament {i + 1}
                </span>
                {meds.length > 1 && (
                  <button
                    onClick={() => removeMed(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Retirer
                  </button>
                )}
              </div>
              <input
                value={m.name}
                onChange={(e) => updateMed(i, "name", e.target.value)}
                placeholder="Nom et dosage (ex: Paracétamol 500 mg)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={m.dosage}
                  onChange={(e) => updateMed(i, "dosage", e.target.value)}
                  placeholder="Posologie (1 cp x3/j)"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                />
                <input
                  value={m.duration}
                  onChange={(e) => updateMed(i, "duration", e.target.value)}
                  placeholder="Durée (5 jours)"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <input
                value={m.instructions}
                onChange={(e) => updateMed(i, "instructions", e.target.value)}
                placeholder="Instructions (après les repas…)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}

          <button
            onClick={addMed}
            className="text-sm text-blue-700 font-medium hover:text-blue-800"
          >
            + Ajouter un médicament
          </button>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Remarques (optionnel)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Pied */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white text-sm font-semibold"
          >
            {saving ? "Enregistrement…" : "Délivrer l'ordonnance"}
          </button>
        </div>
      </div>
    </div>
  );
}
