"use client";

// ============================================================
// AGENDA LIST — components/agenda/AgendaList.tsx
// Liste des RDV patients avec onglets de filtre
// ============================================================

import { Appointment, AgendaFilter } from "@/types/agenda";
import AppointmentCard from "./AppointmentCard";

type Props = {
  appointments: Appointment[];
  filter: AgendaFilter;
  loading: boolean;
  onFilter: (f: AgendaFilter) => void;
  onCancel: (appt: Appointment) => void;
};

// Onglets disponibles
const FILTERS: { key: AgendaFilter; label: string }[] = [
  { key: "today", label: "Auj." },
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
  { key: "cancelled", label: "Annulés" },
];

// Icône et message selon le filtre actif
const EMPTY_STATE: Record<AgendaFilter, { emoji: string; message: string }> = {
  today: { emoji: "📅", message: "Aucun RDV aujourd'hui" },
  upcoming: { emoji: "🗓️", message: "Aucun RDV à venir" },
  past: { emoji: "✅", message: "Aucun RDV passé" },
  cancelled: { emoji: "❌", message: "Aucun RDV annulé" },
};

export default function AgendaList({
  appointments,
  filter,
  loading,
  onFilter,
  onCancel,
}: Props) {
  return (
    <div>
      {/* ── En-tête + onglets ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 text-lg">Rendez-vous</h2>

        {/* Onglets */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onFilter(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                filter === key
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Skeleton chargement ── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Liste vide ── */}
      {!loading && appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">{EMPTY_STATE[filter].emoji}</div>
          <p className="font-medium text-gray-700">
            {EMPTY_STATE[filter].message}
          </p>
        </div>
      )}

      {/* ── Cartes RDV ── */}
      {!loading && (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
