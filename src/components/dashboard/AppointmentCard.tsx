"use client";

// ============================================================
// APPOINTMENT CARD (PATIENT) — components/dashboard/AppointmentCard.tsx
// Carte RDV du tableau de bord patient
// MISE À JOUR : affiche maintenant les infos de paiement
// ============================================================

import { useRouter } from "next/navigation";
import { formatDate, getSpecialtyEmoji, isUpcoming } from "@/lib/dashboard";
import { Appointment } from "@/types/agenda";
import PaymentBadge from "../payment/PaymentBadge";

// Type étendu avec les champs de paiement
type AppointmentWithPayment = Appointment & {
  paid?: boolean;
  amount?: number;
  paymentMethod?: string;
  paymentRef?: string;
};

type Props = {
  appointment: AppointmentWithPayment;
  onCancel: (id: string) => void;
};

export default function AppointmentCard({
  appointment: appt,
  onCancel,
}: Props) {
  const router = useRouter();
  const upcoming = isUpcoming(appt.date) && appt.status === "confirmed";
  const isCancelled = appt.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Emoji spécialité */}
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
          {getSpecialtyEmoji(appt.specialty)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Nom + badge statut */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {appt.doctorName}
              </h3>
              <p className="text-blue-600 text-xs mt-0.5">{appt.specialty}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              {/* Badge statut RDV */}
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  isCancelled
                    ? "bg-red-50 text-red-500"
                    : upcoming
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700"
                }`}
              >
                {isCancelled ? "Annulé" : upcoming ? "Confirmé" : "Terminé"}
              </span>

              {/* Badge paiement compact */}
              <PaymentBadge paid={appt.paid ?? false} compact />
            </div>
          </div>

          {/* Date + ville */}
          <p className="text-gray-500 text-xs mt-2">
            📅 {formatDate(appt.date)}
          </p>
          <p className="text-gray-400 text-xs mt-1">📍 {appt.city}</p>

          {/* Détails du paiement — visible uniquement si payé */}
          {appt.paid && (
            <div className="mt-3">
              <PaymentBadge
                paid={appt.paid}
                amount={appt.amount}
                paymentMethod={appt.paymentMethod}
                paymentRef={appt.paymentRef}
              />
            </div>
          )}

          {/* Raison annulation */}
          {isCancelled && (
            <div className="mt-2 flex items-start gap-2 bg-red-50 px-3 py-2 rounded-lg text-xs text-red-700">
              <span>⚠️</span>
              <span>
                {appt.cancelledBy === "doctor" ? (
                  <>
                    <strong>Annulé par le praticien</strong>
                    {appt.cancelReason && ` · ${appt.cancelReason}`}
                  </>
                ) : (
                  <strong>Annulé par vous</strong>
                )}
              </span>
            </div>
          )}

          {/* Actions RDV à venir */}
          {upcoming && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => router.push(`/doctor/${appt.doctorId}`)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-500 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Voir le médecin
              </button>
              <button
                onClick={() => onCancel(appt.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Reprendre RDV si passé */}
          {!upcoming && !isCancelled && (
            <button
              onClick={() => router.push("/search")}
              className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Reprendre RDV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
