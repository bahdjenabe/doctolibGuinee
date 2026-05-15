"use client";

// ============================================================
// DOCTOR LIST — components/search/DoctorList.tsx
// Liste des médecins filtrés par la recherche
// ============================================================

import { Doctor } from "@/types/doctor";
import DoctorCard from "./DoctorCard";

type Props = {
  doctors: Doctor[]; // liste des médecins à afficher
  selectedDoctor: Doctor | null; // médecin actuellement sélectionné
  onSelect: (doctor: Doctor) => void; // callback quand on clique sur une carte
};

export default function DoctorList({
  doctors,
  selectedDoctor,
  onSelect,
}: Props) {
  return (
    <section className="lg:col-span-3 space-y-4">
      {/* Compteur de résultats */}
      <p className="font-semibold text-gray-800 text-lg">
        {doctors.length} résultat{doctors.length > 1 ? "s" : ""}
      </p>

      {/* Aucun résultat */}
      {doctors.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-gray-700">Aucun médecin trouvé</p>
          <p className="text-gray-400 text-sm mt-1 font-light">
            Essayez avec une autre spécialité ou ville
          </p>
        </div>
      )}

      {/* Liste des cartes médecins */}
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          isSelected={selectedDoctor?.id === doctor.id}
          onSelect={onSelect}
        />
      ))}
    </section>
  );
}
