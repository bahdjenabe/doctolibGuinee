"use client";

// ============================================================
// AGENDA STATS — components/agenda/AgendaStats.tsx
// 4 cartes stats cliquables : Aujourd'hui / À venir / Passés / Annulés
// Au clic → change le filtre actif
// ============================================================

import { AgendaFilter } from "@/types/agenda";

type Props = {
  todayCount: number;
  upcomingCount: number;
  pastCount: number;
  cancelledCount: number;
  activeFilter: AgendaFilter;
  onFilter: (f: AgendaFilter) => void;
};

export default function AgendaStats({
  todayCount,
  upcomingCount,
  pastCount,
  cancelledCount,
  activeFilter,
  onFilter,
}: Props) {
  const cards = [
    {
      label: "Aujourd'hui",
      count: todayCount,
      filter: "today" as AgendaFilter,
      color: "text-blue-700",
      activeBg: "bg-blue-50",
      activeBorder: "border-blue-500",
    },
    {
      label: "À venir",
      count: upcomingCount,
      filter: "upcoming" as AgendaFilter,
      color: "text-green-700",
      activeBg: "bg-green-50",
      activeBorder: "border-green-500",
    },
    {
      label: "Passés",
      count: pastCount,
      filter: "past" as AgendaFilter,
      color: "text-gray-600",
      activeBg: "bg-gray-50",
      activeBorder: "border-gray-400",
    },
    {
      label: "Annulés",
      count: cancelledCount,
      filter: "cancelled" as AgendaFilter,
      color: "text-red-600",
      activeBg: "bg-red-50",
      activeBorder: "border-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isActive = activeFilter === card.filter;
        return (
          <button
            key={card.label}
            onClick={() => onFilter(card.filter)}
            className={`rounded-2xl p-4 text-left border transition-all ${
              isActive
                ? `${card.activeBg} ${card.activeBorder} border-2 shadow-sm`
                : "bg-white border-gray-100 hover:shadow-sm"
            }`}
          >
            {/* Chiffre */}
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.count}
            </div>
            {/* Label */}
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </button>
        );
      })}
    </div>
  );
}
