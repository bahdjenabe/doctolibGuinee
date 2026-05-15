"use client";

// ============================================================
// SCHEDULE HEADER — components/schedule/ScheduleHeader.tsx
// Barre de navigation de la page des disponibilités
// Nom du médecin + boutons retour + voir recherche
// ============================================================

import { useRouter } from "next/navigation";

type Props = {
  doctorId: string; // ID du médecin pour la navigation
  doctorName: string; // nom affiché dans le header
};

export default function ScheduleHeader({ doctorId, doctorName }: Props) {
  const router = useRouter();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Titre + nom du médecin */}
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Disponibilités</h1>
          <p className="text-xs text-gray-400 mt-0.5">{doctorName}</p>
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center gap-2">
          {/* Retour à l'agenda */}
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Retour
          </button>

          {/* Voir la page de recherche */}
          <button
            onClick={() => router.push("/search")}
            className="text-sm text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Voir la recherche
          </button>
        </div>
      </div>
    </header>
  );
}
