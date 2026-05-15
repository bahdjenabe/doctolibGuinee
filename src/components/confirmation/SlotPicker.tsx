"use client";

// ============================================================
// SLOT PICKER — components/confirmation/SlotPicker.tsx
// Grille des créneaux du jour sélectionné
// Permet au patient de changer de créneau sans revenir en arrière
// Séparés en Matin / Après-midi
// ============================================================

type Props = {
  matin: number[]; // créneaux du matin
  apresmidi: number[]; // créneaux de l'après-midi
  bookedSet: Set<number>; // créneaux déjà réservés
  selectedSlot: number | null; // créneau actuellement choisi
  onSelect: (slot: number) => void; // callback au clic
};

export default function SlotPicker({
  matin,
  apresmidi,
  bookedSet,
  selectedSlot,
  onSelect,
}: Props) {
  // Affiche une période (Matin ou Après-midi)
  const renderPeriod = (label: string, slots: number[]) => {
    if (!slots.length) return null;

    return (
      <div className="mb-3">
        {/* Label période */}
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2">
          {label}
        </p>

        {/* Grille 4 colonnes */}
        <div className="grid grid-cols-4 gap-1.5">
          {slots.map((slot) => {
            const isBooked = bookedSet.has(slot); // pris en DB
            const isActive = selectedSlot === slot; // sélectionné

            return (
              <button
                key={slot}
                disabled={isBooked}
                onClick={() => !isBooked && onSelect(slot)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all
                  ${
                    isBooked
                      ? // Réservé → grisé et barré
                        "border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50"
                      : isActive
                        ? // Sélectionné → bleu plein
                          "bg-blue-700 border-blue-700 text-white"
                        : // Libre → contour bleu
                          "border-blue-500 text-blue-700 hover:bg-blue-50"
                  }`}
              >
                {new Date(slot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Si aucun créneau du tout
  if (!matin.length && !apresmidi.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Autres créneaux disponibles ce jour
      </h3>
      {renderPeriod("Matin", matin)}
      {renderPeriod("Après-midi", apresmidi)}
    </div>
  );
}
