"use client";

// ============================================================
// QUICK ACTIONS — components/doctor-dashboard/QuickActions.tsx
// Boutons de raccourcis rapides pour le médecin
// Agenda / Disponibilités / Recherche
// ============================================================

import { useRouter } from "next/navigation";

type Props = {
  doctorId: string;
};

export default function QuickActions({ doctorId }: Props) {
  const router = useRouter();

  const actions = [
    {
      label: "Mon agenda",
      sub: "Voir tous mes RDV",
      emoji: "📅",
      color: "bg-blue-50 border-blue-100 hover:bg-blue-100",
      text: "text-blue-700",
      onClick: () => router.push(`/doctor/${doctorId}/doctorAgenda`),
    },
    {
      label: "Disponibilités",
      sub: "Gérer mes horaires",
      emoji: "🕐",
      color: "bg-green-50 border-green-100 hover:bg-green-100",
      text: "text-green-700",
      onClick: () => router.push(`/admin/doctor/${doctorId}/schedule`),
    },
    {
      label: "Page recherche",
      sub: "Voir mon profil public",
      emoji: "🔍",
      color: "bg-purple-50 border-purple-100 hover:bg-purple-100",
      text: "text-purple-700",
      onClick: () => router.push("/search"),
    },
  ];

  return (
    <div>
      {/* En-tête */}
      <h2 className="font-bold text-gray-900 text-lg mb-4">Accès rapide</h2>

      {/* Grille des raccourcis */}
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={`${action.color} border rounded-2xl p-4 text-left transition-colors`}
          >
            {/* Emoji */}
            <span className="text-2xl block mb-2">{action.emoji}</span>

            {/* Label */}
            <p className={`text-sm font-semibold ${action.text}`}>
              {action.label}
            </p>

            {/* Sous-label */}
            <p className="text-xs text-gray-400 mt-0.5 font-light">
              {action.sub}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
