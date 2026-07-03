"use client";

// ============================================================
// APPOINTMENT CARD (PATIENT) — components/dashboard/AppointmentCard.tsx
// Carte RDV du tableau de bord patient
// MISE À JOUR : affiche maintenant les infos de paiement
// ============================================================

import { useRouter } from "next/navigation";
import { formatDate, getSpecialtyEmoji, isUpcoming } from "@/lib/dashboard";
import { Appointment } from "@/types/appointment";
import { joinWindow } from "@/lib/consultation";
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
  onReschedule: (id: string) => void;
  reviewed: boolean; // ce RDV a-t-il déjà été noté ?
  onReview: (appt: AppointmentWithPayment) => void;
};

export default function AppointmentCard({
  appointment: appt,
  onCancel,
  onReschedule,
  reviewed,
  onReview,
}: Props) {
  const router = useRouter();
  const upcoming = isUpcoming(appt.date) && appt.status === "confirmed";
  const isPending = appt.status === "pending";
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
              <p className="text-blue-600 text-xs mt-0.5">
                {appt.specialty}
                {appt.type === "video" && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                    📹 Visio
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              {/* Badge statut RDV */}
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  isCancelled
                    ? "bg-red-50 text-red-500"
                    : isPending
                      ? "bg-amber-100 text-amber-700"
                      : upcoming
                        ? "bg-blue-50 text-blue-700"
                        : "bg-green-50 text-green-700"
                }`}
              >
                {isCancelled
                  ? "Annulé"
                  : isPending
                    ? "En attente"
                    : upcoming
                      ? "Confirmé"
                      : "Terminé"}
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

          {/* Demande en attente de validation du médecin */}
          {isPending && (
            <>
              <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-xs text-amber-700">
                <span>⏳</span>
                <span>En attente de confirmation par le médecin.</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => router.push(`/doctor/${appt.doctorId}`)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Voir le médecin
                </button>
                <button
                  onClick={() => onCancel(appt.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Annuler la demande
                </button>
              </div>
            </>
          )}

          {/* Actions RDV à venir */}
          {upcoming && (
            <div className="flex flex-wrap gap-2 mt-3">
              {appt.type === "video" && joinWindow(appt.date).open && (
                <button
                  onClick={() => router.push(`/consultation/${appt.id}`)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  🎥 Rejoindre la visio
                </button>
              )}
              <button
                onClick={() => onReschedule(appt.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-500 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Reprogrammer
              </button>
              <button
                onClick={() => router.push(`/doctor/${appt.doctorId}`)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
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

          {/* Actions RDV passé : avis + reprendre RDV */}
          {!upcoming && !isCancelled && !isPending && (
            <div className="flex flex-wrap gap-2 mt-3">
              {reviewed ? (
                <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-600">
                  ✓ Avis publié
                </span>
              ) : (
                <button
                  onClick={() => onReview(appt)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-50 transition-colors"
                >
                  ⭐ Laisser un avis
                </button>
              )}
              <button
                onClick={() => router.push("/search")}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Reprendre RDV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
