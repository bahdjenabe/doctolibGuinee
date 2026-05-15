"use client";

// ============================================================
// DASHBOARD HEADER — components/dashboard/DashboardHeader.tsx
// Barre de navigation du tableau de bord patient
// Logo + bouton recherche + cloche notification + déconnexion
// ============================================================

import { useRouter } from "next/navigation";
import Notification from "../notification/page";

type Props = {
  userName: string; // nom du patient connecté
  userId: string; // UID Firebase pour les notifications
  onLogout: () => void;
};

export default function DashboardHeader({ userName, userId, onLogout }: Props) {
  const router = useRouter();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo → retour à la recherche */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/search")}
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
          {/* Bouton trouver un médecin */}
          <button
            onClick={() => router.push("/search")}
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Trouver un médecin
          </button>

          {/* Cloche de notification */}
          <Notification userId={userId} />

          {/* Avatar + nom */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
              {userName?.charAt(0).toUpperCase() || "P"}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {userName}
            </span>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:block">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
