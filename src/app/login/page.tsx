"use client";

// ============================================================
// PAGE LOGIN — src/app/login/page.tsx
// ============================================================
//
// Page de connexion patient.
//
// FLUX avec redirect :
//   Patient choisit un créneau → pas connecté
//   → redirigé vers /login?redirect=/doctor/[id]?date=XXX
//   → se connecte → retour automatique sur le créneau
//
// Composants :
//   Tout est dans ce fichier (page simple, pas besoin de découper)
// ============================================================

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import GuestRoute from "@/components/GuestRoute";

// ============================================================
// HELPER — traduit les codes d'erreur Firebase en français
// ============================================================
const translateError = (code: string): string => {
  const errors: Record<string, string> = {
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/user-disabled": "Ce compte a été désactivé.",
    "auth/too-many-requests":
      "Trop de tentatives. Réessayez dans quelques minutes.",
    "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
    "auth/invalid-credential": "Email ou mot de passe incorrect.",
  };
  return errors[code] || "Une erreur est survenue. Réessayez.";
};

// ============================================================
// COMPOSANT
// ============================================================
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  // URL vers laquelle rediriger après connexion
  // Ex: /doctor/abc123?date=1713430800000
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // ── States ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Si déjà connecté → redirection immédiate vers la destination
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  // ── Soumission du formulaire ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Retour sur la page d'origine (créneau sélectionné)
      router.push(redirectTo);
    } catch (err: any) {
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <GuestRoute>
      <main className="min-h-screen flex bg-gray-50">
        {/* ── Panel gauche — visuel de marque (desktop uniquement) ── */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-8 relative overflow-hidden bg-gradient-to-br from-[#0b2f6a] via-[#1a56a0] to-[#0d3b7a]">
          {/* GLOW PLUS MODERNE */}
          <div className="absolute w-[520px] h-[520px] bg-cyan-400/20 blur-3xl rounded-full top-[-200px] right-[-200px] animate-pulse" />
          <div className="absolute w-[420px] h-[420px] bg-blue-300/20 blur-3xl rounded-full bottom-[-180px] left-[-150px] animate-pulse" />
          {/* PETITS POINTS MÉDICAUX */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:25px_25px]" />{" "}
          {/* 🌊 GLOW DYNAMIQUE */}
          <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full top-[-200px] right-[-150px] animate-pulse" />
          <div className="absolute w-[400px] h-[400px] bg-cyan-400/10 blur-3xl rounded-full bottom-[-180px] left-[-120px] animate-pulse" />
          {/* LOGO + TRUST */}
          <div className="z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v16M4 12h16"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <span className="text-white font-bold text-lg tracking-wide">
                Doctolib Guinée
              </span>
              {/* <p className="text-white/50 text-xs">
              Plateforme médicale sécurisée
            </p> */}
            </div>
          </div>
          {/* CONTENU PRINCIPAL */}
          <div className="z-10 space-y-3">
            {/* BADGE CONFIANCE */}
            <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-400/30 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span className="text-green-300 text-xs font-semibold tracking-wider uppercase">
                Consultation médicale rapide • Sans attente • Sécurisé{" "}
              </span>
            </div>

            {/* TITRE IMPACT */}
            <h1 className="text-4xl font-bold text-white leading-tight">
              Votre santé mérite un médecin disponible immédiatement{" "}
              <span className="text-cyan-300">en quelques secondes</span>
            </h1>

            {/* PROMESSE */}
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Accédez aux meilleurs médecins de Guinée, sans attente, sans
              stress, directement depuis votre téléphone.
            </p>

            {/* ARGUMENTS CONFIANCE */}
            <div className="space-y-3 mt-6">
              {[
                "✔ Médecins vérifiés et qualifiés",
                "✔ Réservation instantanée",
                "✔ Données 100% sécurisées",
              ].map((t) => (
                <div
                  key={t}
                  className="text-white/70 text-sm flex items-center gap-2"
                >
                  <span className="text-green-400">✓</span>
                  {t}
                </div>
              ))}
            </div>

            {/* STATS + SOCIAL PROOF */}
            <div className="flex gap-8 mt-8">
              {[
                { value: "10k+", label: "Consultations" },
                { value: "500+", label: "Médecins vérifiés" },
                { value: "98%", label: "Satisfaction patients" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="hover:scale-105 transition-transform duration-300"
                >
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* TESTIMONIAL PREMIUM */}
          <div className="z-10 bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300">
            <p className="text-white/80 text-sm italic leading-relaxed">
              “J’ai pu consulter un médecin en urgence sans stress. Tout a été
              rapide et rassurant.”
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black flex items-center justify-center font-bold text-xs">
                AB
              </div>

              <div>
                <p className="text-white text-sm font-medium">Aminata Bah</p>
                <p className="text-white/40 text-xs">Patiente vérifiée</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel droit — formulaire de connexion ── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
          {/* BACKGROUND GLOW ANIMÉ */}
          <div className="absolute w-[420px] h-[420px] bg-blue-200/40 rounded-full blur-3xl top-[-120px] right-[-140px] animate-pulse" />
          <div className="absolute w-[320px] h-[320px] bg-cyan-200/30 rounded-full blur-3xl bottom-[-120px] left-[-140px] animate-pulse" />

          <div className="w-full max-w-md relative z-10">
            {/* CARD GLASS CLEAN */}
            <div className="bg-white/95 backdrop-blur-2xl border border-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] rounded-[32px] p-8">
              {" "}
              {/* HEADER */}
              <div className="text-center mb-8">
                {/* ICON ANIMÉ */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg mb-4 animate-bounce">
                  <span className="text-white text-2xl">🩺</span>
                </div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Bon retour 👋
                </h2>

                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Accédez à vos médecins, vos rendez-vous et votre santé en
                  quelques secondes
                </p>
              </div>
              {/* ALERT REDIRECT */}
              {redirectTo !== "/search" && (
                <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-2xl text-sm">
                  <span className="text-lg">🔐</span>
                  <p>
                    Connectez-vous pour finaliser votre rendez-vous médical en
                    toute sécurité.
                  </p>
                </div>
              )}
              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Adresse email
                  </label>

                  <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <span className="text-gray-400">📧</span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: user@gmail.com"
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>

                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <span className="text-gray-400">🔒</span>

                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl">
                    {error}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl text-white font-semibold shadow-md transition-all
          ${
            loading
              ? "bg-blue-300"
              : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl active:scale-[0.98]"
          }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>
              {/* FOOTER */}
              <div className="text-center mt-6 space-y-3">
                <p className="text-sm text-gray-500">
                  Pas encore de compte ?{" "}
                  <Link
                    href={`/register${
                      redirectTo !== "/search"
                        ? `?redirect=${encodeURIComponent(redirectTo)}`
                        : ""
                    }`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Créer un compte
                  </Link>
                </p>

                <button
                  onClick={() => router.push("/search")}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  Continuer sans compte →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GuestRoute>
  );
}

// ============================================================
// EXPORT — Suspense requis par Next.js car useSearchParams()
// est utilisé dans un composant client prérendu statiquement
// ============================================================
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
