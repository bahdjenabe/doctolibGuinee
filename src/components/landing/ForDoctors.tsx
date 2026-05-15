"use client";

// ============================================================
// FOR DOCTORS — components/landing/ForDoctors.tsx
// Section destinée aux praticiens qui veulent rejoindre la plateforme
// ============================================================

import { useRouter } from "next/navigation";

// Avantages listés pour les médecins
const AVANTAGES = [
  "Agenda en ligne mis à jour en temps réel",
  "Notifications instantanées d'annulation patient",
  "Gestion des disponibilités par plages horaires",
  "Tableau de bord avec statistiques",
  "Zéro appel téléphonique non désiré",
];

// Faux RDV pour la démo visuelle
const FAUX_RDV = [
  {
    heure: "08:00",
    patient: "Aminata Bah",
    statut: "Confirmé",
    dot: "bg-green-400",
  },
  {
    heure: "09:30",
    patient: "Ibrahima Diallo",
    statut: "Confirmé",
    dot: "bg-green-400",
  },
  {
    heure: "11:00",
    patient: "Kadiatou Sow",
    statut: "En attente",
    dot: "bg-yellow-400",
  },
  {
    heure: "14:00",
    patient: "Mamadou Camara",
    statut: "Confirmé",
    dot: "bg-green-400",
  },
];

export default function ForDoctors() {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 py-24 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* ── Colonne gauche — texte ── */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5 mb-6">
            <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">
              Pour les praticiens
            </span>
          </div>

          {/* Titre */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            Optimisez votre agenda médical
          </h2>

          {/* Description */}
          <p className="text-white/70 font-light leading-relaxed mb-8">
            Gérez vos disponibilités, consultez votre agenda en temps réel et
            restez informé des annulations de vos patients.
          </p>

          {/* Liste des avantages */}
          <ul className="space-y-3 mb-10">
            {AVANTAGES.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                {/* Icône coche */}
                <div className="w-5 h-5 rounded-md bg-yellow-500/25 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d4af37"
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm font-light">{item}</span>
              </li>
            ))}
          </ul>

          {/* Bouton CTA */}
          <button
            onClick={() => router.push("/register")}
            className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold px-7 py-3.5 rounded-xl transition-colors"
          >
            Rejoindre la plateforme →
          </button>
        </div>

        {/* ── Colonne droite — faux dashboard ── */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6">
          {/* Header du faux dashboard */}
          <div className="flex justify-between items-center mb-5">
            <p className="text-white font-semibold text-sm">Agenda du jour</p>
            <span className="bg-green-500/25 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
              En ligne
            </span>
          </div>

          {/* Liste des faux RDV */}
          <div className="space-y-3">
            {FAUX_RDV.map((rdv, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                {/* Heure */}
                <span className="text-white font-semibold text-sm w-12 flex-shrink-0">
                  {rdv.heure}
                </span>

                {/* Nom patient */}
                <span className="text-white/80 text-sm flex-1">
                  {rdv.patient}
                </span>

                {/* Statut */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${rdv.dot}`} />
                  <span className="text-white/60 text-xs">{rdv.statut}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stat du jour */}
          <div className="mt-5 bg-yellow-500/15 border border-yellow-500/25 rounded-xl py-4 text-center">
            <p className="text-yellow-400 text-3xl font-bold">4</p>
            <p className="text-white/50 text-xs mt-1">
              RDV confirmés aujourd'hui
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
