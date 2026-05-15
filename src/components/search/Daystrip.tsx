"use client";

// ============================================================
// DAY STRIP — components/search/DayStrip.tsx
// Bande horizontale des 7 prochains jours
// Affiche le nombre de créneaux disponibles par jour
// ============================================================

import { Doctor } from "@/types/doctor";
import { countAvailable } from "@/lib/slots";

// Noms courts des jours en français
const DAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
// Noms courts des mois en français
const MONTHS_FR = [
  "jan",
  "fév",
  "mar",
  "avr",
  "mai",
  "jun",
  "jul",
  "aoû",
  "sep",
  "oct",
  "nov",
  "déc",
];

type Props = {
  doctor: Doctor; // médecin sélectionné
  bookedSet: Set<number>; // créneaux déjà réservés
  selectedDate: string | null; // date actuellement sélectionnée
  onSelectDate: (date: string) => void; // callback au clic sur un jour
};

export default function DayStrip({
  doctor,
  bookedSet,
  selectedDate,
  onSelectDate,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {/* Affiche les 7 prochains jours */}
      {Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0]; // format "YYYY-MM-DD"

        // Nombre de créneaux disponibles ce jour pour ce médecin
        const availCount = countAvailable(
          dateStr,
          doctor.workingHours || {},
          bookedSet,
        );

        const isSelected = selectedDate === dateStr;
        const hasSlots = availCount > 0;

        return (
          <button
            key={i}
            disabled={!hasSlots}
            onClick={() => {
              if (hasSlots) onSelectDate(dateStr);
            }}
            className={`min-w-[62px] p-2.5 rounded-xl border text-center transition-all flex-shrink-0
              ${
                isSelected
                  ? "bg-blue-700 border-blue-700 text-white" // jour sélectionné
                  : hasSlots
                    ? "bg-gray-50 border-gray-200 hover:border-blue-400 cursor-pointer" // dispo
                    : "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed" // fermé/complet
              }`}
          >
            {/* Nom du jour : lun., mar., ... */}
            <div
              className={`text-[10px] uppercase tracking-wide font-medium ${
                isSelected ? "text-blue-100" : "text-gray-400"
              }`}
            >
              {DAYS_FR[d.getDay()]}
            </div>

            {/* Numéro du jour + mois : 20 avr. */}
            <div
              className={`text-sm font-bold mt-0.5 ${
                isSelected ? "text-white" : "text-gray-800"
              }`}
            >
              {d.getDate()} {MONTHS_FR[d.getMonth()]}
            </div>

            {/* Compteur : "8 dispo" ou "complet" */}
            <div
              className={`text-[10px] mt-0.5 font-medium ${
                isSelected
                  ? "text-blue-100"
                  : hasSlots
                    ? "text-blue-600"
                    : "text-gray-400"
              }`}
            >
              {hasSlots ? `${availCount} dispo` : "complet"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
