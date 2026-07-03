"use client";

// ============================================================
// TODAY APPOINTMENTS — components/doctor-dashboard/TodayAppointments.tsx
// Liste des rendez-vous du jour pour le médecin
// Triés par heure, avec statut coloré
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinWindow } from "@/lib/consultation";
import PrescriptionModal from "@/components/documents/PrescriptionModal";

type Appointment = {
  id: string;
  patientId?: string;
  patientName: string;
  date: string;
  status: string;
  cancelledBy?: string;
  type?: "cabinet" | "video";
};

type Props = {
  doctorId: string;
  doctorName?: string;
  specialty?: string;
  appointments: Appointment[]; // RDV du jour uniquement
};

// Parse la date et retourne l'heure formatée : "09:00"
const getTime = (dateStr: string): string => {
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(local).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Retourne true si le RDV est passé (heure déjà passée aujourd'hui)
const isPast = (dateStr: string): boolean => {
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(local).getTime() < Date.now();
};

export default function TodayAppointments({
  doctorId,
  doctorName,
  specialty,
  appointments,
}: Props) {
  const router = useRouter();
  // RDV pour lequel on rédige une ordonnance (null = modal fermé)
  const [prescribeFor, setPrescribeFor] = useState<Appointment | null>(null);

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 text-lg">RDV du jour</h2>

        {/* Lien vers l'agenda complet */}
        <button
          onClick={() => router.push(`/admin/doctor/${doctorId}/agenda`)}
          className="text-sm text-blue-700 font-medium hover:text-blue-800 transition-colors"
        >
          Voir l'agenda →
        </button>
      </div>

      {/* ── Aucun RDV aujourd'hui ── */}
      {appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">🌴</div>
          <p className="font-medium text-gray-700">
            Aucun rendez-vous aujourd'hui
          </p>
          <p className="text-gray-400 text-sm mt-1 font-light">
            Profitez de votre journée libre !
          </p>
        </div>
      )}

      {/* ── Liste des RDV ── */}
      <div className="space-y-3">
        {appointments.map((appt) => {
          const past = isPast(appt.date);
          const cancelled = appt.status === "cancelled";
          const time = getTime(appt.date);

          return (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                cancelled
                  ? "border-red-100 opacity-60"
                  : "border-gray-100 hover:shadow-sm"
              }`}
            >
              {/* Heure */}
              <div
                className={`text-center min-w-[52px] px-2 py-2 rounded-xl ${
                  cancelled ? "bg-red-50" : past ? "bg-gray-50" : "bg-blue-50"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    cancelled
                      ? "text-red-400"
                      : past
                        ? "text-gray-400"
                        : "text-blue-700"
                  }`}
                >
                  {time}
                </p>
              </div>

              {/* Avatar initiales */}
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {appt.patientName?.charAt(0).toUpperCase() || "?"}
              </div>

              {/* Nom du patient */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm ${cancelled ? "text-gray-400 line-through" : "text-gray-900"}`}
                >
                  {appt.patientName || "Patient inconnu"}
                </p>
                {cancelled && (
                  <p className="text-xs text-red-400 mt-0.5">
                    {appt.cancelledBy === "patient"
                      ? "Annulé par le patient"
                      : "Annulé par vous"}
                  </p>
                )}
                {!cancelled && past && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Consultation passée
                  </p>
                )}
                {appt.type === "video" && !cancelled && (
                  <p className="text-[11px] text-blue-600 mt-0.5 font-medium">
                    📹 Téléconsultation
                  </p>
                )}
              </div>

              {/* Bouton rejoindre la visio (dans la fenêtre d'accès) */}
              {appt.type === "video" &&
                !cancelled &&
                joinWindow(appt.date).open && (
                  <button
                    onClick={() => router.push(`/consultation/${appt.id}`)}
                    className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  >
                    🎥 Rejoindre
                  </button>
                )}

              {/* Rédiger une ordonnance */}
              {!cancelled && appt.patientId && (
                <button
                  onClick={() => setPrescribeFor(appt)}
                  title="Rédiger une ordonnance"
                  className="flex-shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  💊
                </button>
              )}

              {/* Badge statut */}
              <span
                className={`flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  cancelled
                    ? "bg-red-50 text-red-500"
                    : past
                      ? "bg-gray-50 text-gray-500"
                      : "bg-green-50 text-green-700"
                }`}
              >
                {cancelled ? "Annulé" : past ? "Terminé" : "Confirmé"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal ordonnance */}
      {prescribeFor && prescribeFor.patientId && (
        <PrescriptionModal
          doctorId={doctorId}
          doctorName={doctorName || "Médecin"}
          specialty={specialty}
          patientId={prescribeFor.patientId}
          patientName={prescribeFor.patientName || "Patient"}
          appointmentId={prescribeFor.id}
          onClose={() => setPrescribeFor(null)}
        />
      )}
    </div>
  );
}
