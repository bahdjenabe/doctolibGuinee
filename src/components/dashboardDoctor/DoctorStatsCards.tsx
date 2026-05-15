"use client";

// ============================================================
// DOCTOR STATS CARDS — components/doctor-dashboard/DoctorStatsCards.tsx
// 4 cartes statistiques du praticien :
//   - RDV aujourd'hui
//   - RDV à venir
//   - RDV ce mois
//   - Taux d'annulation
// ============================================================

type Props = {
  todayCount: number; // RDV confirmés aujourd'hui
  upcomingCount: number; // RDV confirmés futurs (hors aujourd'hui)
  monthCount: number; // RDV confirmés ce mois
  cancelledCount: number; // RDV annulés total
  totalCount: number; // total RDV (pour le taux)
};

export default function DoctorStatsCards({
  todayCount,
  upcomingCount,
  monthCount,
  cancelledCount,
  totalCount,
}: Props) {
  // Taux d'annulation en % (arrondi)
  const cancelRate =
    totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;

  const cards = [
    {
      label: "Aujourd'hui",
      value: todayCount.toString(),
      sub: "RDV confirmés",
      emoji: "📅",
      bg: "bg-blue-50",
      border: "border-blue-100",
      color: "text-blue-700",
    },
    {
      label: "À venir",
      value: upcomingCount.toString(),
      sub: "Prochains RDV",
      emoji: "🗓️",
      bg: "bg-green-50",
      border: "border-green-100",
      color: "text-green-700",
    },
    {
      label: "Ce mois",
      value: monthCount.toString(),
      sub: "RDV ce mois-ci",
      emoji: "📊",
      bg: "bg-purple-50",
      border: "border-purple-100",
      color: "text-purple-700",
    },
    {
      label: "Annulations",
      value: `${cancelRate}%`,
      sub: `${cancelledCount} annulé${cancelledCount > 1 ? "s" : ""}`,
      emoji: "❌",
      bg: "bg-red-50",
      border: "border-red-100",
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${card.bg} border ${card.border} rounded-2xl p-4`}
        >
          {/* Emoji + label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{card.emoji}</span>
            <span className="text-xs text-gray-500 font-medium">
              {card.label}
            </span>
          </div>

          {/* Valeur principale */}
          <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>

          {/* Sous-label */}
          <div className="text-xs text-gray-400 mt-1 font-light">
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
