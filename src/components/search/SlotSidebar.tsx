"use client";

// ============================================================
// SLOT SIDEBAR — components/search/SlotSidebar.tsx
// Sidebar droite avec :
//   - Photo + nom du médecin sélectionné
//   - Bande des 7 jours (DayStrip)
//   - Grille des créneaux du jour (SlotGrid)
//   - Bouton de confirmation
// ============================================================

import { useRouter } from "next/navigation";
import { Doctor } from "@/types/doctor";
import { generateSlots, getDayName } from "@/lib/slots";
import SlotGrid from "./SlotGrid";
import DayStrip from "./Daystrip";

type Props = {
  doctor: Doctor | null; // médecin sélectionné
  bookedSet: Set<number>; // créneaux réservés
  selectedDate: string | null; // date choisie
  selectedSlot: number | null; // créneau choisi
  onSelectDate: (date: string) => void; // callback sélection date
  onSelectSlot: (slot: number) => void; // callback sélection créneau
};

export default function SlotSidebar({
  doctor,
  bookedSet,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: Props) {
  const router = useRouter();

  // Si aucun médecin sélectionné
  if (!doctor || !selectedDate) {
    return (
      <aside className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24">
        <p className="text-gray-400 text-sm text-center py-8">
          Aucun créneau disponible
        </p>
      </aside>
    );
  }

  // Génère les créneaux du jour sélectionné
  const getSlotsForDate = () => {
    if (!selectedDate || !doctor.workingHours) return [];
    const dn = getDayName(selectedDate);
    const ranges = doctor.workingHours[dn] || [];
    return generateSlots(selectedDate, ranges);
  };

  const allSlots = getSlotsForDate();
  const totalAvail = allSlots.filter((s) => !bookedSet.has(s)).length;

  return (
    <aside className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm sticky top-24 space-y-4">
      {/* ── En-tête médecin ── */}
      <div className="flex items-center gap-3">
        <img
          src={doctor.image || "/default-doctor.png"}
          alt={doctor.name}
          className="w-11 h-11 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm text-gray-900">{doctor.name}</p>
          <p className="text-xs text-blue-600">{doctor.specialty}</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ── Titre section date ── */}
      <p className="text-sm font-semibold text-gray-800">Choisir une date</p>

      {/* ── Bande des 7 jours ── */}
      <DayStrip
        doctor={doctor}
        bookedSet={bookedSet}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      {/* ── Grille de créneaux ── */}
      {selectedDate && allSlots.length > 0 && (
        <div>
          {/* Titre du jour + badge disponibilités */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                "fr-FR",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                },
              )}
            </p>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                totalAvail > 0
                  ? "bg-green-100 text-green-700" // créneaux disponibles
                  : "bg-red-50 text-red-500" // complet
              }`}
            >
              {totalAvail > 0 ? `${totalAvail} disponibles` : "Complet"}
            </span>
          </div>

          <SlotGrid
            slots={allSlots}
            bookedSet={bookedSet}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
          />
        </div>
      )}

      {/* Message si le jour n'a pas de créneaux */}
      {selectedDate && allSlots.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-3">
          Pas de consultation ce jour
        </p>
      )}

      {/* ── Bouton de confirmation ── */}
      <button
        disabled={!selectedSlot}
        onClick={() => router.push(`/doctor/${doctor.id}?date=${selectedSlot}`)}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
          selectedSlot
            ? "bg-blue-700 hover:bg-blue-800 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {selectedSlot
          ? `Confirmer · ${new Date(selectedSlot).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Sélectionnez un créneau"}
      </button>
    </aside>
  );
}
