"use client";

// ============================================================
// CANCEL MODAL — components/dashboard/CancelModal.tsx
// Modal de confirmation quand le patient veut annuler un RDV
// Avertit que l'action est irréversible
// ============================================================

type Props = {
  cancelling: boolean; // true pendant l'annulation Firestore
  onConfirm: () => void; // confirme l'annulation
  onClose: () => void; // ferme la modal sans annuler
};

export default function CancelModal({ cancelling, onConfirm, onClose }: Props) {
  return (
    // Overlay sombre
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose} // ferme au clic extérieur
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()} // empêche fermeture au clic intérieur
      >
        {/* Icône d'avertissement */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg
            width="24"
            height="24"
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

        {/* Titre */}
        <h3 className="font-bold text-gray-900 text-lg text-center mb-2">
          Annuler ce rendez-vous ?
        </h3>

        {/* Message */}
        <p className="text-gray-500 text-sm text-center mb-6 font-light">
          Le médecin sera notifié instantanément. Le créneau sera libéré pour
          d'autres patients.
        </p>

        {/* Boutons */}
        <div className="flex gap-3">
          {/* Garder le RDV */}
          <button
            disabled={cancelling}
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Garder le RDV
          </button>

          {/* Confirmer l'annulation */}
          <button
            disabled={cancelling}
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
              cancelling
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
              "Oui, annuler"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
