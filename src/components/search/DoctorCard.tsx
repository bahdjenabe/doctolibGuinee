"use client";

// ============================================================
// DOCTOR CARD — components/search/DoctorCard.tsx
// Carte affichant les infos d'un médecin dans la liste
// Au clic → sélectionne ce médecin pour afficher ses créneaux
// ============================================================

import { Doctor } from "@/types/doctor";

type Props = {
  doctor: Doctor;
  isSelected: boolean; // vrai si ce médecin est sélectionné
  onSelect: (doctor: Doctor) => void; // callback au clic
};

export default function DoctorCard({ doctor, isSelected, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(doctor)}
      className={`bg-white rounded-2xl border p-5 flex gap-4 cursor-pointer
        hover:shadow-md transition-all
        ${isSelected ? "border-blue-500 shadow-sm" : "border-gray-100"}`}
    >
      {/* Photo du médecin */}
      <img
        src={doctor.image || "/default-doctor.png"}
        alt={doctor.name}
        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
      />

      {/* Informations */}
      <div>
        <h2 className="font-semibold text-gray-900">{doctor.name}</h2>
        <p className="text-blue-600 text-sm mt-0.5">{doctor.specialty}</p>
        <p className="text-gray-400 text-xs mt-1">📍 {doctor.city}</p>
        <p className="text-yellow-500 text-xs mt-1">
          ⭐ {doctor.rating} ({doctor.reviews} avis)
        </p>
      </div>
    </div>
  );
}
