"use client";

// ============================================================
// APPOINTMENT LIST — components/dashboard/AppointmentList.tsx
// Liste des rendez-vous avec onglets de filtre
// Affiche : À venir / Passés / Annulés
// ============================================================

import { useRouter } from "next/navigation";
import { Appointment, Filter } from "@/types/appointment";
import AppointmentCard from "./AppointmentCard";

type Props = {
  appointments: Appointment[]; // liste filtrée à afficher
  filter: Filter; // filtre actif
  loading: boolean; // chargement Firestore
  onFilter: (f: Filter) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  reviewedIds: Set<string>; // IDs des RDV déjà notés
  onReview: (appt: Appointment) => void;
};

// Labels des onglets
const FILTERS: { key: Filter; label: string }[] = [
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
  { key: "cancelled", label: "Annulés" },
];

export default function AppointmentList({
  appointments,
  filter,
  loading,
  onFilter,
  onCancel,
  onReschedule,
  reviewedIds,
  onReview,
}: Props) {
  const router = useRouter();

  return (
    <div>
      {/* ── En-tête + onglets ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 text-lg">Mes rendez-vous</h2>

        {/* Onglets de filtre */}
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

      {/* ── Skeleton de chargement ── */}
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
          <div className="text-4xl mb-3">
            {filter === "upcoming" ? "📅" : filter === "past" ? "✅" : "❌"}
          </div>
          <p className="font-medium text-gray-700">
            {filter === "upcoming"
              ? "Aucun rendez-vous à venir"
              : filter === "past"
                ? "Aucun rendez-vous passé"
                : "Aucun rendez-vous annulé"}
          </p>
          {filter === "upcoming" && (
            <button
              onClick={() => router.push("/search")}
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Prendre un rendez-vous
            </button>
          )}
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
              onReschedule={onReschedule}
              reviewed={reviewedIds.has(appt.id)}
              onReview={onReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
