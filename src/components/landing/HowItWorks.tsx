"use client";

// ============================================================
// HOW IT WORKS — components/landing/HowItWorks.tsx
// Section "Comment ça marche" — 3 étapes simples
// ============================================================

import { useRouter } from "next/navigation";

// Les 3 étapes de la prise de RDV
const ETAPES = [
  {
    numero: "01",
    titre: "Recherchez",
    desc: "Trouvez un médecin par spécialité, nom ou ville. Consultez son profil, ses horaires et ses disponibilités en temps réel.",
    emoji: "🔍",
  },
  {
    numero: "02",
    titre: "Choisissez",
    desc: "Sélectionnez le créneau qui vous convient parmi les disponibilités du praticien. Matin ou après-midi, selon votre agenda.",
    emoji: "📅",
  },
  {
    numero: "03",
    titre: "Confirmez",
    desc: "Créez votre compte gratuit et confirmez en un clic. Gérez vos rendez-vous depuis votre tableau de bord personnel.",
    emoji: "✅",
  },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <section className="bg-white py-24 px-6" id="comment">
      <div className="max-w-5xl mx-auto">
        {/* ── Titre de section ── */}
        <div className="text-center mb-16">
          <p className="text-yellow-500 text-xs font-bold tracking-widest uppercase mb-3">
            Simple comme bonjour
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Prenez rendez-vous en 3 étapes
          </h2>
          <p className="text-gray-500 font-light max-w-md mx-auto">
            Aucune file d'attente, aucun déplacement inutile. Tout depuis votre
            téléphone.
          </p>
        </div>

        {/* ── Grille des 3 étapes ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ETAPES.map((etape, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow relative"
            >
              {/* Numéro d'étape en badge */}
              <div className="absolute -top-4 left-6 w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {etape.numero}
                </span>
              </div>

              {/* Emoji */}
              <div className="text-4xl mb-4 mt-4">{etape.emoji}</div>

              {/* Titre */}
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                {etape.titre}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                {etape.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Bouton CTA ── */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/search")}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            Trouver mon médecin →
          </button>
        </div>
      </div>
    </section>
  );
}
