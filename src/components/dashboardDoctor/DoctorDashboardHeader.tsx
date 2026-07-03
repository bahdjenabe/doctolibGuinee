"use client";

// ============================================================
// DOCTOR DASHBOARD HEADER — components/doctor-dashboard/DoctorDashboardHeader.tsx
// Barre de navigation du tableau de bord praticien
// Logo + nom du médecin + cloche notification + navigation
// ============================================================

import { useRouter } from "next/navigation";
import NotificationBell from "../notification/page";

type Props = {
  doctorId: string; // ID Firestore du médecin (pour les notifications)
  doctorName: string; // nom affiché dans le header
  specialty: string; // spécialité affichée sous le nom
};

export default function DoctorDashboardHeader({
  doctorId,
  doctorName,
  specialty,
}: Props) {
  const router = useRouter();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo → accueil */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v16M4 12h16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-bold text-blue-900 text-base">
            Doctolib Guinée
          </span>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {/* Bouton → agenda */}
          <button
            onClick={() => router.push(`/doctor/${doctorId}/doctorAgenda`)}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Mon agenda
          </button>

          {/* Messagerie */}
          <button
            onClick={() => router.push("/messages")}
            title="Messagerie"
            className="w-[38px] h-[38px] rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-base transition-colors"
          >
            💬
          </button>

          {/* Cloche de notification
              Le médecin reçoit les annulations des patients ici */}
          <NotificationBell userId={doctorId} />

          {/* Avatar + nom */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
              {doctorName?.charAt(0).toUpperCase() || "D"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700 leading-tight">
                {doctorName}
              </p>
              <p className="text-xs text-gray-400">{specialty}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
