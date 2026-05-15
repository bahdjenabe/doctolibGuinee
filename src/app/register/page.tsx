"use client";

// ============================================================
// PAGE REGISTER — src/app/register/page.tsx
// ============================================================

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import GuestRoute from "@/components/GuestRoute";

// ============================================================
// HELPER — Traduction erreurs Firebase
// ============================================================

const translateFirebaseError = (code: string): string => {
  const errors: Record<string, string> = {
    "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/weak-password":
      "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
    "auth/operation-not-allowed":
      "L'inscription est temporairement désactivée.",
  };

  return errors[code] || "Une erreur est survenue. Réessayez.";
};

// ============================================================
// PASSWORD STRENGTH
// ============================================================

const getPasswordStrength = (password: string): number => {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;

  return score;
};

const strengthLabels = ["", "Faible", "Correct", "Bon", "Excellent"];

const strengthColors = [
  "",
  "bg-red-500",
  "bg-orange-400",
  "bg-blue-500",
  "bg-green-500",
];

// ============================================================
// COMPONENT
// ============================================================

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, user, loading: authLoading } = useAuth();

  const redirectTo = searchParams.get("redirect") || "/search";

  // ──────────────────────────────────────────
  // STATES
  // ──────────────────────────────────────────

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  // ──────────────────────────────────────────
  // REDIRECTION SI CONNECTÉ
  // ──────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  // ──────────────────────────────────────────
  // VALIDATION
  // ──────────────────────────────────────────

  const validate = (): string | null => {
    if (!name.trim()) return "Veuillez entrer votre nom complet.";

    if (name.trim().length < 2)
      return "Le nom doit contenir au moins 2 caractères.";

    if (!email.trim()) return "Veuillez entrer votre adresse email.";

    if (!password) return "Veuillez choisir un mot de passe.";

    if (password.length < 6)
      return "Le mot de passe doit contenir au moins 6 caractères.";

    if (password !== confirmPass)
      return "Les mots de passe ne correspondent pas.";

    return null;
  };

  // ──────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);

      router.push(redirectTo);
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
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
        {/* ============================================================
            LEFT PANEL
        ============================================================ */}

        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-8 relative overflow-hidden bg-gradient-to-br from-[#0b2f6a] via-[#1a56a0] to-[#0d3b7a]">
          {/* GLOW */}
          <div className="absolute w-[520px] h-[520px] bg-cyan-400/20 blur-3xl rounded-full top-[-200px] right-[-200px] animate-pulse" />
          <div className="absolute w-[420px] h-[420px] bg-blue-300/20 blur-3xl rounded-full bottom-[-180px] left-[-150px] animate-pulse" />

          {/* GRID */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:25px_25px]" />

          {/* HEADER */}
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
            </div>
          </div>

          {/* CONTENT */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />

              <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">
                Inscription gratuite
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight">
              Rejoignez les meilleurs médecins de{" "}
              <span className="text-cyan-300">Guinée</span>
            </h1>

            <p className="text-white/60 text-sm mt-5 leading-relaxed max-w-sm">
              Prenez rendez-vous rapidement avec des médecins qualifiés,
              directement depuis votre téléphone.
            </p>

            {/* FEATURES */}
            <div className="space-y-4 mt-8">
              {[
                "✔ Réservation rapide en ligne",
                "✔ Historique médical sécurisé",
                "✔ Notifications automatiques",
                "✔ Médecins vérifiés",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-white/80 text-sm"
                >
                  <span className="text-green-400">✓</span>
                  {item}
                </div>
              ))}
            </div>

            {/* STATS */}
            <div className="flex gap-8 mt-10">
              {[
                {
                  value: "500+",
                  label: "Médecins",
                },
                {
                  value: "10k+",
                  label: "Patients",
                },
                {
                  value: "98%",
                  label: "Satisfaction",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-bold text-white">{item.value}</p>

                  <p className="text-xs text-white/50">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIAL */}
          <div className="z-10 bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm italic leading-relaxed">
              “Grâce à Doctolib Guinée, j’ai trouvé un spécialiste très
              rapidement sans me déplacer.”
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs">
                MB
              </div>

              <div>
                <p className="text-white text-sm font-medium">Mariama Bah</p>

                <p className="text-white/40 text-xs">Patiente vérifiée</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT PANEL
        ============================================================ */}

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
          {/* GLOW */}
          <div className="absolute w-[420px] h-[420px] bg-blue-200/40 rounded-full blur-3xl top-[-120px] right-[-140px] animate-pulse" />

          <div className="absolute w-[320px] h-[320px] bg-cyan-200/30 rounded-full blur-3xl bottom-[-120px] left-[-140px] animate-pulse" />

          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/95 backdrop-blur-2xl border border-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] rounded-[32px] p-8">
              {/* HEADER */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg mb-4 animate-bounce">
                  <span className="text-white text-2xl">🩺</span>
                </div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Créer un compte
                </h2>

                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Gratuit • Rapide • Sécurisé
                </p>
              </div>

              {/* ALERT */}
              {redirectTo !== "/search" && (
                <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-2xl text-sm">
                  <span className="text-lg">🔐</span>

                  <p>
                    Créez votre compte pour finaliser votre rendez-vous médical.
                  </p>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NAME */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nom complet
                  </label>

                  <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <span className="text-gray-400">👤</span>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mamadou Diallo"
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>

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
                  <label className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>

                  <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <span className="text-gray-400">🔒</span>

                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
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

                  {/* PASSWORD STRENGTH */}
                  {password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength >= level
                                ? strengthColors[passwordStrength]
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-gray-500">
                        {strengthLabels[passwordStrength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>

                  <div
                    className={`mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border bg-gray-50 transition-all ${
                      confirmPass && password === confirmPass
                        ? "border-green-400"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="text-gray-400">✅</span>

                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Répétez votre mot de passe"
                      className="w-full bg-transparent outline-none text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirm ? "🙈" : "👁"}
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
                      Création du compte...
                    </span>
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </form>

              {/* FOOTER */}
              <div className="text-center mt-6 space-y-3">
                <p className="text-sm text-gray-500">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    href={`/login${
                      redirectTo !== "/search"
                        ? `?redirect=${encodeURIComponent(redirectTo)}`
                        : ""
                    }`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Se connecter
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
