"use client";

// ============================================================
// SPECIALTIES — components/landing/Specialties.tsx
// Grille des spécialités médicales disponibles
// Chaque carte est cliquable → redirige vers /search
// ============================================================

import { useRouter } from "next/navigation";

const SPECIALITES = [
  {
    emoji: "❤️",
    label: "Cardiologie",
    name: "cardiologue",
    desc: "Cœur & cardiovasculaire",
  },
  {
    emoji: "🧠",
    label: "Neurologie",
    name: "neurologue",
    desc: "Cerveau & système nerveux",
  },
  {
    emoji: "🦷",
    label: "Dentisterie",
    name: "dentiste",
    desc: "Santé bucco-dentaire",
  },
  {
    emoji: "👶",
    label: "Pédiatrie",
    name: "pédiatre",
    desc: "Santé de l'enfant",
  },
  {
    emoji: "🌸",
    label: "Gynécologie",
    name: "gynécologue",
    desc: "Santé féminine",
  },
  {
    emoji: "👁️",
    label: "Ophtalmologie",
    name: "ophtalmologiste",
    desc: "Santé des yeux",
  },
  {
    emoji: "🧴",
    label: "Dermatologie",
    name: "dermatologue",
    desc: "Peau & maladies cutanées",
  },
  {
    emoji: "🩺",
    label: "Médecine générale",
    name: "généraliste",
    desc: "Soins de premier recours",
  },
  {
    emoji: "🦴",
    label: "Orthopédie",
    name: "orthopédiste",
    desc: "Os & articulations",
  },
  {
    emoji: "💊",
    label: "Pharmacie",
    name: "pharmacien",
    desc: "Médicaments & conseils",
  },
  {
    emoji: "🩻",
    label: "Radiologie",
    name: "radiologue",
    desc: "Imagerie médicale",
  },
  {
    emoji: "🧬",
    label: "Laboratoire",
    name: "biologiste",
    desc: "Analyses médicales",
  },
];

export default function Specialties() {
  const router = useRouter();

  return (
    <section className="bg-gray-50 py-24 px-6" id="specialites">
      <div className="max-w-5xl mx-auto">
        {/* ── Titre de section ── */}
        <div className="text-center mb-12">
          <p className="text-yellow-500 text-xs font-bold tracking-widest uppercase mb-3">
            Nos médecins
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Toutes les spécialités médicales
          </h2>
          <p className="text-gray-500 font-light">
            Des généralistes aux spécialistes — tous disponibles près de chez
            vous.
          </p>
        </div>

        {/* ── Grille 4 colonnes ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SPECIALITES.map((spec, i) => (
            <button
              key={i}
              onClick={() =>
                router.push(`/search?query=${encodeURIComponent(spec.name)}`)
              }
              className="bg-white rounded-2xl p-5 border border-gray-100 text-left
                         hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg
                         transition-all group"
            >
              {/* Emoji */}
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                {spec.emoji}
              </span>

              {/* Nom de la spécialité */}
              <p className="text-gray-900 font-semibold text-sm group-hover:text-white transition-colors">
                {spec.label}
              </p>

              {/* Description */}
              <p className="text-gray-400 text-xs mt-1 font-light group-hover:text-blue-100 transition-colors">
                {spec.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
