"use client";

// ============================================================
// AGENDA APPOINTMENT CARD (MÉDECIN) — components/agenda/AgendaAppointmentCard.tsx
// Carte RDV dans l'agenda du médecin
// MISE À JOUR : affiche les infos de paiement du patient
// ============================================================

import { Appointment } from "@/types/agenda";
import { formatDate, isUpcoming, isToday } from "@/lib/agenda";
import PaymentBadge from "@/components/payment/PaymentBadge";

// Type étendu avec les champs de paiement
type AppointmentWithPayment = Appointment & {
  paid?: boolean;
  amount?: number;
  paymentMethod?: string;
  paymentRef?: string;
};

type Props = {
  appointment: AppointmentWithPayment;
  onCancel: (appt: AppointmentWithPayment) => void;
  onConfirm: (appt: AppointmentWithPayment) => void;
};

export default function AgendaAppointmentCard({
  appointment: appt,
  onCancel,
  onConfirm,
}: Props) {
  // Demande en attente de validation par le médecin
  const isPending = appt.status === "pending";

  // Annulation possible seulement si RDV confirmé et futur
  const canCancel = appt.status === "confirmed" && isUpcoming(appt.date);

  // Badge statut du RDV
  const getBadge = () => {
    if (appt.status === "cancelled")
      return { label: "Annulé", className: "bg-red-50 text-red-500" };
    if (isPending)
      return { label: "En attente", className: "bg-amber-100 text-amber-700" };
    if (isToday(appt.date))
      return { label: "Aujourd'hui", className: "bg-amber-50 text-amber-700" };
    if (isUpcoming(appt.date))
      return { label: "Confirmé", className: "bg-blue-50 text-blue-700" };
    return { label: "Terminé", className: "bg-green-50 text-green-700" };
  };

  const badge = getBadge();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar initiales du patient */}
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {appt.patientName?.charAt(0).toUpperCase() || "?"}
        </div>

        <div className="flex-1 min-w-0">
          {/* Nom patient + badges */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {appt.patientName || "Patient inconnu"}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                📅 {formatDate(appt.date)}
              </p>
            </div>

            {/* Badges statut + paiement */}
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badge.className}`}
              >
                {badge.label}
              </span>
              <PaymentBadge paid={appt.paid ?? false} compact />
            </div>
          </div>

          {/* Détails du paiement — section complète */}
          {appt.paid ? (
            <div className="mt-3">
              <PaymentBadge
                paid={appt.paid}
                amount={appt.amount}
                paymentMethod={appt.paymentMethod}
                paymentRef={appt.paymentRef}
              />
            </div>
          ) : (
            /* RDV non payé — alerte pour le médecin */
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-xs text-amber-700">
              <span>⚠️</span>
              <span className="font-medium">Paiement non effectué</span>
            </div>
          )}

          {/* Raison annulation */}
          {appt.status === "cancelled" && (
            <div className="mt-2 flex items-start gap-2 bg-red-50 px-3 py-2 rounded-lg text-xs text-red-700">
              <span>⚠️</span>
              <span>
                {appt.cancelledBy === "doctor" ? (
                  <>
                    <strong>Annulé par vous</strong>
                    {appt.cancelReason && ` · ${appt.cancelReason}`}
                  </>
                ) : (
                  <strong>Annulé par le patient</strong>
                )}
              </span>
            </div>
          )}

          {/* Demande en attente → Confirmer / Refuser */}
          {isPending && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onConfirm(appt)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Confirmer
              </button>
              <button
                onClick={() => onCancel(appt)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Refuser
              </button>
            </div>
          )}

          {/* Bouton annuler */}
          {canCancel && (
            <button
              onClick={() => onCancel(appt)}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Annuler ce rendez-vous
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
