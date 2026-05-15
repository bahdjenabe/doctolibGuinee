"use client";

// ============================================================
// NAVBAR — components/landing/Navbar.tsx
// Barre de navigation fixe en haut de la page
// Devient blanche avec ombre quand on scrolle
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  // Détecte si l'utilisateur a scrollé pour changer le style
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md" // fond blanc au scroll
          : "bg-transparent" // transparent sur le hero
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* ── Logo ── */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v16M4 12h16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            className={`font-bold text-lg transition-colors duration-300 ${
              scrolled ? "text-blue-900" : "text-white"
            }`}
          >
            Doctolib Guinée
          </span>
        </div>

        {/* ── Liens + boutons ── */}
        <div className="flex items-center gap-4">
          {/* Lien connexion */}
          <Link
            href="/login"
            className={`text-sm font-medium transition-colors duration-300 ${
              scrolled
                ? "text-gray-600 hover:text-blue-700"
                : "text-white/80 hover:text-white"
            }`}
          >
            Connexion
          </Link>

          {/* Bouton inscription */}
          <Link
            href="/register"
            className="text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
}
