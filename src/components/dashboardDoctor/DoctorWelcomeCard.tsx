"use client";

// ============================================================
// DOCTOR WELCOME CARD — components/doctor-dashboard/DoctorWelcomeCard.tsx
// Carte hero du tableau de bord praticien
// Affiche : bonjour + date du jour + résumé du jour
// ============================================================

type Props = {
  doctorName: string; // nom du médecin
  todayCount: number; // nombre de RDV confirmés aujourd'hui
  nextPatient: string | null; // nom du prochain patient du jour
  nextTime: string | null; // heure du prochain RDV
};

export default function DoctorWelcomeCard({
  doctorName,
  todayCount,
  nextPatient,
  nextTime,
}: Props) {
  // Date du jour en français : "Lundi 20 avril 2026"
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Première lettre en majuscule
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="bg-gradient-to-br from-blue-700 to-blue-950 rounded-2xl p-6 text-white">
      {/* Date du jour */}
      <p className="text-blue-200 text-sm font-light mb-3">📅 {todayLabel}</p>

      {/* Bonjour Docteur */}
      <h1 className="text-2xl font-bold text-white mb-1">
        Bonjour, {doctorName} 👋
      </h1>

      {/* Résumé du jour */}
      <p className="text-blue-200 font-light text-sm mb-5">
        {todayCount === 0
          ? "Vous n'avez aucun rendez-vous aujourd'hui."
          : `Vous avez ${todayCount} rendez-vous aujourd'hui.`}
      </p>

      {/* Prochain patient du jour */}
      {nextPatient && nextTime && (
        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-0.5">Prochain patient</p>
            <p className="text-white font-semibold text-sm">{nextPatient}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs mb-0.5">Heure</p>
            <p className="text-yellow-400 font-bold text-sm">{nextTime}</p>
          </div>
        </div>
      )}

      {/* Aucun RDV aujourd'hui */}
      {todayCount === 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
          <p className="text-white/60 text-sm">🌴 Journée libre</p>
        </div>
      )}
    </div>
  );
}
