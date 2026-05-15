"use client";

// ============================================================
// CANCEL REASON MODAL — components/agenda/CancelReasonModal.tsx
// Modal d'annulation côté médecin
//
// RÈGLE MÉTIER IMPORTANTE :
//   Le médecin NE PEUT PAS annuler sans donner une raison.
//   Le bouton "Confirmer" reste désactivé tant qu'aucune
//   raison n'est sélectionnée ou écrite.
//
//   La raison est stockée dans Firestore (cancelReason)
//   et visible par le patient dans son dashboard.
// ============================================================

import { useState } from "react";
import { Appointment, CANCEL_REASONS } from "@/types/agenda";
import { formatDate } from "@/lib/agenda";

type Props = {
  appointment: Appointment; // RDV à annuler
  cancelling: boolean; // true pendant l'annulation Firestore
  onConfirm: (reason: string) => void; // callback avec la raison choisie
  onClose: () => void; // ferme la modal sans annuler
};

export default function CancelReasonModal({
  appointment,
  cancelling,
  onConfirm,
  onClose,
}: Props) {
  // Raison prédéfinie sélectionnée
  const [selectedReason, setSelectedReason] = useState("");
  // Raison personnalisée si "Autre raison" est sélectionné
  const [customReason, setCustomReason] = useState("");
  // Erreur si le médecin clique sans raison
  const [error, setError] = useState("");

  // La raison finale : prédéfinie ou personnalisée
  const finalReason =
    selectedReason === "Autre raison"
      ? customReason.trim()
      : selectedReason.trim();

  // Le bouton est activé seulement si une raison valide est fournie
  const canConfirm = !!finalReason;

  const handleConfirm = () => {
    if (!canConfirm) {
      setError("Veuillez sélectionner ou écrire une raison d'annulation.");
      return;
    }
    setError("");
    onConfirm(finalReason);
  };

  return (
    // Overlay sombre
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête rouge ── */}
        <div className="bg-red-50 px-6 py-5 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Annuler le rendez-vous
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Le patient sera notifié instantanément.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Récapitulatif du RDV ── */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-semibold text-gray-900">
              👤 {appointment.patientName || "Patient inconnu"}
            </p>
            <p className="text-gray-500">📅 {formatDate(appointment.date)}</p>
          </div>

          {/* ── Sélection de la raison ──
              OBLIGATOIRE — bouton désactivé tant que vide ── */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Raison de l'annulation <span className="text-red-500">*</span>
            </p>

            {/* Grille des raisons prédéfinies */}
            <div className="grid grid-cols-2 gap-2">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setSelectedReason(reason);
                    setError("");
                    if (reason !== "Autre raison") setCustomReason("");
                  }}
                  className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                    selectedReason === reason
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Champ texte si "Autre raison" sélectionné */}
            {selectedReason === "Autre raison" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Décrivez la raison de l'annulation..."
                rows={3}
                className="mt-3 w-full text-sm px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            )}
          </div>

          {/* Erreur si pas de raison */}
          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Note informative */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-xl text-xs text-amber-700">
            <span className="flex-shrink-0 mt-0.5">💡</span>
            <span>
              La raison sera visible par le patient. Le créneau sera libéré
              immédiatement.
            </span>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            {/* Fermer sans annuler */}
            <button
              disabled={cancelling}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>

            {/* Confirmer l'annulation — désactivé si pas de raison */}
            <button
              disabled={cancelling || !canConfirm}
              onClick={handleConfirm}
              className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                cancelling || !canConfirm
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {cancelling ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Annulation...
                </span>
              ) : (
                "Confirmer l'annulation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
