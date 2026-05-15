"use client";

// ============================================================
// SELECTED SLOT — components/confirmation/SelectedSlot.tsx
// Affiche le créneau sélectionné depuis /search
// Si aucun créneau → message vide
// ============================================================

type Props = {
  slot: number | null; // timestamp du créneau sélectionné
};

export default function SelectedSlot({ slot }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-3">
        Créneau sélectionné
      </h2>

      {slot ? (
        // Créneau choisi → fond bleu avec date et heure
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-2xl">📅</span>
          <div>
            {/* Date complète : Lundi 20 avril 2026 */}
            <p className="font-semibold text-blue-800 text-sm">
              {new Date(slot).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {/* Heure : 09:00 */}
            <p className="text-blue-600 text-sm mt-0.5">
              {new Date(slot).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ) : (
        // Aucun créneau sélectionné
        <p className="text-gray-400 text-sm">Aucun créneau sélectionné</p>
      )}
    </div>
  );
}
