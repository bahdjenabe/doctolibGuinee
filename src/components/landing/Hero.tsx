"use client";

// ============================================================
// HERO — components/landing/Hero.tsx
// Section principale avec titre, sous-titre et barre de recherche
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Redirige vers la page de recherche avec le terme saisi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search${query ? `?query=${encodeURIComponent(query)}` : ""}`);
  };

  // Spécialités suggérées cliquables sous la barre de recherche
  const suggestions = [
    "Cardiologue",
    "Gynécologue",
    "Pédiatre",
    "Dentiste",
    "Généraliste",
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex flex-col items-center justify-center px-6 pt-16">
      <div className="max-w-3xl w-full text-center">
        {/* ── Badge en haut ── */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">
            La santé numérique en Guinée
          </span>
        </div>

        {/* ── Titre principal ── */}
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          Votre santé mérite{" "}
          <span className="text-yellow-400 italic">le meilleur</span> médecin
        </h1>

        {/* ── Sous-titre ── */}
        <p className="text-lg text-white/70 font-light leading-relaxed mb-10 max-w-xl mx-auto">
          Trouvez un spécialiste, réservez en ligne et gérez vos rendez-vous —
          rapidement, simplement, gratuitement.
        </p>

        {/* ── Barre de recherche ── */}
        <form onSubmit={handleSearch} className="flex max-w-lg mx-auto mb-6">
          {/* Champ texte */}
          <div className="flex-1 flex items-center gap-3 bg-white/10 border border-white/25 rounded-l-xl px-4">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Spécialité, nom de médecin..."
              className="bg-transparent w-full py-4 text-white placeholder-white/50 text-sm focus:outline-none"
            />
          </div>

          {/* Bouton rechercher */}
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold px-6 rounded-r-xl transition-colors text-sm"
          >
            Rechercher
          </button>
        </form>

        {/* ── Suggestions rapides ── */}
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((spec) => (
            <button
              key={spec}
              onClick={() =>
                router.push(`/search?query=${encodeURIComponent(spec)}`)
              }
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all"
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vague de transition vers la section suivante ── */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60L1440 60L1440 30C1200 60 960 0 720 15C480 30 240 60 0 30L0 60Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
}
