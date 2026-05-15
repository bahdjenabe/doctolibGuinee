"use client";

// ============================================================
// SLOT GRID — components/search/SlotGrid.tsx
// Grille des créneaux disponibles pour une date donnée
// Séparés en Matin / Après-midi comme Doctolib
// ============================================================

type Props = {
  slots: number[]; // tous les créneaux du jour
  bookedSet: Set<number>; // créneaux déjà réservés
  selectedSlot: number | null; // créneau actuellement sélectionné
  onSelectSlot: (slot: number) => void; // callback au clic sur un créneau
};

export default function SlotGrid({
  slots,
  bookedSet,
  selectedSlot,
  onSelectSlot,
}: Props) {
  // Sépare les créneaux en matin (avant 13h) et après-midi
  const matin = slots.filter((s) => new Date(s).getHours() < 13);
  const apresmidi = slots.filter((s) => new Date(s).getHours() >= 13);

  // Affiche une période (Matin ou Après-midi)
  const renderPeriod = (label: string, periodSlots: number[]) => {
    if (periodSlots.length === 0) return null;

    return (
      <div>
        {/* Label de période */}
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2">
          {label}
        </p>

        {/* Grille 4 colonnes */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {periodSlots.map((slot) => {
            const isBooked = bookedSet.has(slot); // créneau pris en DB
            const isActive = selectedSlot === slot; // créneau sélectionné

            return (
              <button
                key={slot}
                disabled={isBooked}
                onClick={() => !isBooked && onSelectSlot(slot)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all
                  ${
                    isBooked
                      ? // Pris → grisé et barré
                        "border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50"
                      : isActive
                        ? // Sélectionné → bleu plein
                          "bg-blue-700 border-blue-700 text-white"
                        : // Disponible → contour bleu
                          "border-blue-500 text-blue-700 hover:bg-blue-50"
                  }`}
              >
                {/* Heure formatée : "09:00" */}
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

  return (
    <div>
      {renderPeriod("Matin", matin)}
      {renderPeriod("Après-midi", apresmidi)}
    </div>
  );
}
