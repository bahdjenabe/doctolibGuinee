"use client";

// ============================================================
// NEXT APPOINTMENT CARD — components/dashboard/NextAppointmentCard.tsx
// Carte hero qui affiche le prochain rendez-vous à venir
// Fond bleu dégradé avec badge doré
// ============================================================

import { useRouter } from "next/navigation";
import { Appointment } from "@/types/appointment";
import { formatDate, getSpecialtyEmoji } from "@/lib/dashboard";
import { joinWindow } from "@/lib/consultation";

type Props = {
  appointment: Appointment | null; // prochain RDV (null si aucun)
  onCancel: (id: string) => void; // callback pour annuler
  onReschedule: (id: string) => void; // callback pour reprogrammer
};

export default function NextAppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: Props) {
  const router = useRouter();

  // Aucun RDV à venir → carte vide avec CTA
  if (!appointment) {
    return (
      <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">📅</div>
        <p className="font-semibold text-gray-700">Aucun rendez-vous à venir</p>
        <p className="text-gray-400 text-sm mt-1 font-light">
          Prenez rendez-vous avec un médecin dès maintenant
        </p>
        <button
          onClick={() => router.push("/search")}
          className="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Trouver un médecin
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-700 to-blue-950 rounded-2xl p-5 text-white">
      {/* Badge "Prochain rendez-vous" */}
      <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-yellow-400 text-xs font-semibold">
          Prochain rendez-vous
        </span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          {/* Nom du médecin */}
          <h2 className="text-xl font-bold text-white">
            {appointment.doctorName}
          </h2>

          {/* Spécialité */}
          <p className="text-blue-200 text-sm mt-0.5 font-light">
            {getSpecialtyEmoji(appointment.specialty)} {appointment.specialty}
          </p>

          {/* Badge mode visio */}
          {appointment.type === "video" && (
            <span className="inline-flex items-center gap-1 mt-2 bg-white/15 border border-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              📹 Téléconsultation vidéo
            </span>
          )}

          {/* Date */}
          <p className="text-blue-100 text-sm mt-3 font-medium">
            📅 {formatDate(appointment.date)}
          </p>

          {/* Ville */}
          <p className="text-blue-200 text-xs mt-1 font-light">
            📍 {appointment.city}
          </p>
        </div>

        {/* Boutons reprogrammer / annuler */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {appointment.type === "video" &&
            joinWindow(appointment.date).open && (
              <button
                onClick={() => router.push(`/consultation/${appointment.id}`)}
                className="text-xs font-semibold text-blue-900 bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-lg transition-all"
              >
                🎥 Rejoindre
              </button>
            )}
          <button
            onClick={() => onReschedule(appointment.id)}
            className="text-xs text-white bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-lg transition-all"
          >
            Reprogrammer
          </button>
          <button
            onClick={() => onCancel(appointment.id)}
            className="text-xs text-white/50 hover:text-white/90 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
