"use client";

// ============================================================
// DAY CARD — components/schedule/DayCard.tsx
// Carte d'un jour de la semaine avec ses plages horaires
// Permet d'ajouter des plages (preset ou manuelle)
// et de les supprimer une par une ou toutes
// ============================================================

import { Day } from "@/types/schedule";
import PresetButtons from "./PresetButtons";
import CustomRangeInput from "./CustomRangeInput";

type Props = {
  day: Day; // infos du jour (key + label)
  ranges: string[]; // plages horaires actuelles
  onAdd: (day: string, range: string) => void; // ajouter une plage
  onRemove: (day: string, range: string) => void; // supprimer une plage
  onClear: (day: string) => void; // vider toutes les plages
};

export default function DayCard({
  day,
  ranges,
  onAdd,
  onRemove,
  onClear,
}: Props) {
  const isEmpty = ranges.length === 0; // jour sans plage = jour de repos

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 transition-opacity ${
        isEmpty ? "opacity-60" : ""
      }`}
    >
      {/* ── En-tête du jour ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Nom du jour */}
          <h2 className="font-semibold text-gray-900">{day.label}</h2>

          {/* Badge : Repos ou nombre de plages */}
          {isEmpty ? (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Repos
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {ranges.length} plage{ranges.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Bouton "Tout effacer" — visible seulement si le jour a des plages */}
        {!isEmpty && (
          <button
            onClick={() => onClear(day.key)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* ── Plages actives avec bouton supprimer ── */}
      {ranges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <div
              key={range}
              className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              {/* Heure de la plage */}
              <span>{range}</span>

              {/* Bouton × pour supprimer cette plage */}
              <button
                onClick={() => onRemove(day.key, range)}
                className="text-blue-400 hover:text-red-500 transition-colors text-base leading-none ml-0.5"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Plages prédéfinies ── */}
      <PresetButtons
        currentRanges={ranges}
        onAdd={(range) => onAdd(day.key, range)}
      />

      {/* ── Saisie manuelle ── */}
      <CustomRangeInput onAdd={(range) => onAdd(day.key, range)} />
    </div>
  );
}
