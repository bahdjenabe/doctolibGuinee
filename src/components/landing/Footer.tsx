"use client";

// ============================================================
// FOOTER — components/landing/Footer.tsx
// Pied de page avec liens et copyright
// ============================================================

import { useRouter } from "next/navigation";

// Colonnes du footer
const COLONNES = [
  {
    titre: "Patients",
    liens: [
      "Trouver un médecin",
      "Créer un compte",
      "Se connecter",
      "Mon tableau de bord",
      "Mes rendez-vous",
    ],
  },
  {
    titre: "Praticiens",
    liens: [
      "Rejoindre la plateforme",
      "Gérer mon agenda",
      "Mes disponibilités",
      "Tableau de bord",
      "Tarifs",
    ],
  },
  {
    titre: "À propos",
    liens: [
      "Notre mission",
      "Contact",
      "Conditions d'utilisation",
      "Politique de confidentialité",
      "Mentions légales",
    ],
  },
];

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-gray-950 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Grille principale ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Colonne logo + description */}
          <div>
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer mb-4"
              onClick={() => router.push("/")}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4v16M4 12h16"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-base">
                Doctolib Guinée
              </span>
            </div>

            {/* Description */}
            <p className="text-white/40 text-sm font-light leading-relaxed mb-5">
              La première plateforme de prise de rendez-vous médical en ligne en
              Guinée.
            </p>

            {/* Étoiles */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-yellow-400 text-sm">
                  ★
                </span>
              ))}
              <span className="text-white/30 text-xs ml-2">
                4.9/5 · 2 000+ avis
              </span>
            </div>
          </div>

          {/* Colonnes de liens */}
          {COLONNES.map((col) => (
            <div key={col.titre}>
              <p className="text-white font-semibold text-sm mb-4">
                {col.titre}
              </p>
              <ul className="space-y-2.5">
                {col.liens.map((lien) => (
                  <li key={lien}>
                    <button className="text-white/40 hover:text-white/80 text-sm font-light transition-colors text-left">
                      {lien}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Séparateur + copyright ── */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-sm font-light">
            © 2026 Doctolib Guinée. Tous droits réservés.
          </p>
          <p className="text-white/30 text-sm font-light">
            🇬🇳 Conakry, République de Guinée
          </p>
        </div>
      </div>
    </footer>
  );
}
