"use client";

// ============================================================
// SEARCH BAR — components/search/SearchBar.tsx
// Barre de recherche sticky en haut de la page
// ============================================================

import { useRouter } from "next/navigation";

type Props = {
  value: string; // valeur actuelle du champ
  onChange: (val: string) => void; // callback quand l'utilisateur tape
};

export default function SearchBar({ value, onChange }: Props) {
  const router = useRouter();

  // Redirige vers /search?query=... au clic sur "Rechercher"
  const handleSearch = () => {
    router.push(`/search?query=${encodeURIComponent(value)}`);
  };

  // Même chose si l'utilisateur appuie sur Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="sticky top-0 bg-white z-50 border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-6 py-4">
        {/* Logo cliquable → retour accueil */}
        <h1
          onClick={() => router.push("/")}
          className="text-blue-700 font-bold text-lg cursor-pointer whitespace-nowrap"
        >
          Doctolib Guinée
        </h1>

        {/* Champ de recherche */}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nom, spécialité..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {/* Bouton rechercher */}
        <button
          onClick={handleSearch}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Rechercher
        </button>
      </div>
    </div>
  );
}
