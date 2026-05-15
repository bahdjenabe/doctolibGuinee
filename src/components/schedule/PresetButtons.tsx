"use client";

// ============================================================
// PRESET BUTTONS — components/schedule/PresetButtons.tsx
// Boutons de plages horaires prédéfinies à cliquer rapidement
// Ex: "08:00-12:00", "14:00-18:00"...
// Les plages déjà ajoutées sont grisées et non cliquables
// ============================================================

import { PRESET_RANGES } from "@/types/schedule";

type Props = {
  currentRanges: string[]; // plages déjà ajoutées pour ce jour
  onAdd: (range: string) => void; // callback quand on clique sur un preset
};

export default function PresetButtons({ currentRanges, onAdd }: Props) {
  return (
    <div>
      {/* Label */}
      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2">
        Ajouter une plage rapide
      </p>

      {/* Grille de boutons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_RANGES.map((preset) => {
          // Plage déjà présente → grisée
          const alreadyAdded = currentRanges.includes(preset);

          return (
            <button
              key={preset}
              onClick={() => !alreadyAdded && onAdd(preset)}
              disabled={alreadyAdded}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                alreadyAdded
                  ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                  : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>
    </div>
  );
}
