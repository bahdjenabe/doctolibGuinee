"use client";

// ============================================================
// TESTIMONIALS — components/landing/Testimonials.tsx
// Avis de patients satisfaits
// ============================================================

const TEMOIGNAGES = [
  {
    nom: "Fatoumata Bah",
    ville: "Conakry",
    initiales: "FB",
    texte:
      "En moins de 5 minutes, j'ai trouvé un cardiologue et pris rendez-vous. C'est exactement ce dont la Guinée avait besoin !",
    bgAvatar: "bg-blue-100",
    textAvatar: "text-blue-700",
  },
  {
    nom: "Mamadou Sylla",
    ville: "Kindia",
    initiales: "MS",
    texte:
      "Je vis à Kindia et je peux maintenant consulter des spécialistes à Conakry sans me déplacer inutilement. Révolutionnaire.",
    bgAvatar: "bg-yellow-100",
    textAvatar: "text-yellow-700",
  },
  {
    nom: "Aissatou Diallo",
    ville: "Labé",
    initiales: "AD",
    texte:
      "L'annulation et la reprise de rendez-vous se font en un clic. Mon médecin est notifié immédiatement. Parfait !",
    bgAvatar: "bg-green-100",
    textAvatar: "text-green-700",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Titre ── */}
        <div className="text-center mb-12">
          <p className="text-yellow-500 text-xs font-bold tracking-widest uppercase mb-3">
            Ils nous font confiance
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900">
            Ce que disent nos patients
          </h2>
        </div>

        {/* ── Grille des témoignages ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMOIGNAGES.map((tem, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Étoiles */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-yellow-400 text-sm">
                    ★
                  </span>
                ))}
              </div>

              {/* Texte du témoignage */}
              <p className="text-gray-600 text-sm leading-relaxed font-light italic mb-6">
                "{tem.texte}"
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-3">
                {/* Avatar initiales */}
                <div
                  className={`w-10 h-10 rounded-full ${tem.bgAvatar} ${tem.textAvatar} flex items-center justify-center font-bold text-sm`}
                >
                  {tem.initiales}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">
                    {tem.nom}
                  </p>
                  <p className="text-gray-400 text-xs">📍 {tem.ville}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
