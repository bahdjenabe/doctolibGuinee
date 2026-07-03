"use client";

// ============================================================
// PENDING REQUESTS ALERT — components/dashboardDoctor/PendingRequestsAlert.tsx
// Bandeau d'alerte sur le tableau de bord médecin quand des demandes
// de RDV sont EN ATTENTE de validation. Mène directement à l'onglet
// "À valider" de l'agenda.
// ============================================================

import { useRouter } from "next/navigation";

type Props = {
  doctorId: string;
  count: number; // nombre de demandes en attente
};

export default function PendingRequestsAlert({ doctorId, count }: Props) {
  const router = useRouter();

  // Rien à afficher s'il n'y a aucune demande en attente
  if (count <= 0) return null;

  return (
    <button
      onClick={() =>
        router.push(`/doctor/${doctorId}/doctorAgenda?filter=pending`)
      }
      className="w-full flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left hover:bg-amber-100 transition-colors"
    >
      {/* Pastille animée */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
          ⏳
        </div>
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-800 text-sm">
          {count} demande{count > 1 ? "s" : ""} de rendez-vous à valider
        </p>
        <p className="text-amber-600 text-xs mt-0.5">
          Confirmez ou refusez {count > 1 ? "ces demandes" : "cette demande"}{" "}
          pour informer {count > 1 ? "vos patients" : "votre patient"}.
        </p>
      </div>

      <span className="text-amber-500 text-lg flex-shrink-0">→</span>
    </button>
  );
}
