"use client";

// ============================================================
// PAGE REGISTER — src/app/register/page.tsx
// ============================================================
//
// Page d'inscription patient.
// Si déjà connecté → redirige vers /search (via GuestRoute)
//
// Composants utilisés :
//   - RegisterForm    → formulaire complet avec validation
//   - PasswordStrength → indicateur de force (dans RegisterForm)
//   - GuestRoute      → redirige si déjà connecté
// ============================================================

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GuestRoute from "@/components/GuestRoute";
import RegisterForm from "@/components/register/RegisterForm";

// ============================================================
// CONTENU DE LA PAGE
// Séparé pour être enveloppé dans GuestRoute
// ============================================================

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, loading } = useAuth();

  // URL de redirection après inscription
  const redirectTo = searchParams.get("redirect") || "/search";

  // Soumission → appelle register() depuis AuthContext
  const handleSubmit = async (
    name: string,
    email: string,
    password: string,
  ) => {
    await register(name, email, password);
    router.push(redirectTo);
  };

  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* ── Panel gauche — visuel de marque (desktop uniquement) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v16M4 12h16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-white text-xl font-bold">Doctolib Guinée</span>
        </div>

        {/* Accroche centrale */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">
              Inscription gratuite
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Rejoignez des{" "}
            <span className="text-yellow-400 italic">milliers</span> de patients
            guinéens
          </h1>

          {/* Liste des avantages */}
          {[
            { emoji: "📅", text: "Prenez RDV en moins de 2 minutes" },
            {
              emoji: "🔔",
              text: "Rappels automatiques avant votre consultation",
            },
            { emoji: "📋", text: "Historique complet de vos rendez-vous" },
            { emoji: "🔒", text: "Données personnelles sécurisées" },
            { emoji: "💊", text: "Accès à +500 spécialistes en Guinée" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-sm">
                {item.emoji}
              </div>
              <span className="text-blue-100 text-sm font-light">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Étoiles d'avis */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className="text-yellow-400 text-sm">
              ★
            </span>
          ))}
          <span className="text-white/40 text-xs ml-1 font-light">
            4.9/5 · Plus de 2 000 avis patients
          </span>
        </div>
      </div>

      {/* ── Panel droit — formulaire d'inscription ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Logo mobile uniquement */}
          <div
            className="flex lg:hidden items-center gap-2 mb-8 cursor-pointer"
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
            <span className="text-gray-900 font-bold text-lg">
              Doctolib Guinée
            </span>
          </div>

          {/* Bandeau info si redirection depuis un créneau */}
          {redirectTo !== "/search" && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm mb-6">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>
                Créez votre compte pour confirmer votre rendez-vous. Vous serez
                redirigé automatiquement.
              </span>
            </div>
          )}

          {/* Titre */}
          <div className="mb-7">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Créer un compte
            </h2>
            <p className="text-gray-500 font-light">
              Gratuit et sans engagement · 2 minutes suffisent
            </p>
          </div>

          {/* Formulaire */}
          <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
            redirectTo={redirectTo}
          />
        </div>
      </div>
    </main>
  );
}

// ============================================================
// EXPORT — enveloppé dans GuestRoute
// Si déjà connecté → redirige vers /search ou le redirect param
// ============================================================

export default function RegisterPage() {
  return (
    <Suspense>
      <GuestRoute>
        <RegisterContent />
      </GuestRoute>
    </Suspense>
  );
}
