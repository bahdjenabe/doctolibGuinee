"use client";

// ============================================================
// REMINDER BANNER — components/dashboard/ReminderBanner.tsx
// Bannière de rappel pour un rendez-vous imminent (≤ 24h).
// Toujours visible quand le patient ouvre son espace.
// ============================================================

import { Appointment } from "@/types/appointment";
import { parseDate, formatDate } from "@/lib/dashboard";

type Props = {
  appointment: Appointment | null; // RDV imminent (null si aucun)
};

export default function ReminderBanner({ appointment }: Props) {
  if (!appointment) return null;

  const diff = parseDate(appointment.date).getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  const relative =
    hours >= 1
      ? `dans ${hours}h${mins > 0 ? ` ${mins}min` : ""}`
      : `dans ${mins} min`;

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
      <span className="text-2xl flex-shrink-0">⏰</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          Rappel · votre rendez-vous est {relative}
        </p>
        <p className="text-sm text-amber-700 mt-0.5">
          {appointment.doctorName} · {formatDate(appointment.date)}
        </p>
      </div>
    </div>
  );
}
