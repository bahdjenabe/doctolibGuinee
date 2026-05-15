"use client";

// ============================================================
// AGENDA HEADER — components/agenda/AgendaHeader.tsx
// Barre de navigation de la page agenda médecin
// Nom du médecin + boutons navigation + cloche notification
// ============================================================

import { useRouter } from "next/navigation";
import Notification from "../notification/page";

type Props = {
  doctorId: string; // ID Firestore du médecin (pour les notifications)
  doctorName: string; // nom affiché dans le header
  specialty: string; // spécialité affichée sous le nom
};

export default function AgendaHeader({
  doctorId,
  doctorName,
  specialty,
}: Props) {
  const router = useRouter();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Nom + spécialité du médecin */}
        <div>
          <h1 className="font-bold text-gray-900 text-lg">
            Agenda — {doctorName}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{specialty}</p>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-2">
          {/* Cloche de notification médecin
              Reçoit les notifications quand un patient annule un RDV */}
          <Notification userId={doctorId} />

          {/* Bouton → page des disponibilités */}
          <button
            onClick={() => router.push(`/admin/doctor/${doctorId}/schedule`)}
            className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Disponibilités
          </button>

          {/* Bouton → retour à la recherche */}
          <button
            onClick={() =>
              router.push(`/admin/doctor/${doctorId}/dashboardDoctor`)
            }
            className="text-sm text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    </header>
  );
}
