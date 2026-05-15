"use client";

import { Doctor } from "@/types/doctor";

// ============================================================
// DOCTOR PROFILE — components/confirmation/DoctorProfile.tsx
// Affiche la photo, le nom, la spécialité et la ville du médecin
// ============================================================

// type Doctor = {
//   name: string;
//   specialty: string;
//   city: string;
//   image?: string;
//   rating?: number;
//   reviews?: number;
// };

type Props = {
  doctor: Doctor;
};

export default function DoctorProfile({ doctor }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
      {/* Photo du médecin */}
      <img
        src={doctor.image || "/default-doctor.png"}
        alt={doctor.name}
        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
      />

      {/* Informations */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{doctor.name}</h1>
        <p className="text-blue-600 font-medium text-sm mt-1">
          {doctor.specialty}
        </p>
        <p className="text-gray-400 text-sm mt-1">📍 {doctor.city}</p>
        <p className="text-yellow-500 text-sm mt-1">
          ⭐ {doctor.rating} ({doctor.reviews} avis)
        </p>
      </div>
    </div>
  );
}
