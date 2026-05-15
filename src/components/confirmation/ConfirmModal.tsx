"use client";

// ============================================================
// CONFIRM MODAL — components/confirmation/ConfirmModal.tsx
// Modal qui s'affiche quand le patient clique sur "Confirmer"
// Deux états :
//   1. Récapitulatif → boutons Annuler / Confirmer
//   2. Succès → icône verte + message de confirmation
// ============================================================

type Doctor = {
  name: string;
  specialty: string;
  city: string;
};

type Props = {
  doctor: Doctor;
  slot: number | null; // créneau à confirmer
  patientName: string; // nom du patient connecté
  confirming: boolean; // true pendant l'appel Firestore
  success: boolean; // true après confirmation réussie
  error: string; // message d'erreur éventuel
  onConfirm: () => void; // callback pour confirmer
  onClose: () => void; // callback pour fermer la modal
};

export default function ConfirmModal({
  doctor,
  slot,
  patientName,
  confirming,
  success,
  error,
  onConfirm,
  onClose,
}: Props) {
  return (
    // Fond sombre derrière la modal
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose} // ferme au clic sur le fond
    >
      {/* Carte de la modal */}
      <div
        className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // empêche la fermeture au clic intérieur
      >
        {/* ── État succès ── */}
        {success ? (
          <div className="text-center py-6">
            {/* Icône coche verte */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Rendez-vous confirmé !
            </h2>
            <p className="text-gray-500 text-sm">
              Votre RDV avec {doctor.name} est enregistré.
            </p>

            {/* Date et heure du RDV */}
            {slot && (
              <p className="text-blue-600 font-semibold text-sm mt-3">
                {new Date(slot).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                à{" "}
                {new Date(slot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            <p className="text-gray-400 text-xs mt-3">
              Redirection vers votre tableau de bord...
            </p>
          </div>
        ) : (
          /* ── État récapitulatif ── */
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Confirmer le rendez-vous
            </h2>

            {/* Récapitulatif du RDV */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <span>🩺</span>
                <span className="font-semibold">{doctor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💊</span>
                <span>{doctor.specialty}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{doctor.city}</span>
              </div>
              {slot && (
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="font-semibold text-blue-700">
                    {new Date(slot).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    à{" "}
                    {new Date(slot).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span>{patientName}</span>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3">
              {/* Annuler → ferme la modal */}
              <button
                disabled={confirming}
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>

              {/* Confirmer → écrit dans Firestore */}
              <button
                disabled={confirming}
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                  confirming
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {confirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    En cours...
                  </span>
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
