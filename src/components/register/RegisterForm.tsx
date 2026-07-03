"use client";

// ============================================================
// REGISTER FORM — components/register/RegisterForm.tsx
// Formulaire d'inscription avec :
//   - Nom complet
//   - Email
//   - Mot de passe + indicateur de force
//   - Confirmation mot de passe
//   - Validation côté client
//   - Erreurs Firebase en français
// ============================================================

import { useState } from "react";
import Link from "next/link";
import PasswordStrength from "./PasswordStrength";

// Traduit les codes d'erreur Firebase en français
const translateError = (code: string): string => {
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

type Props = {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  redirectTo: string; // pour le lien "Se connecter" qui garde le redirect
};

export default function RegisterForm({ onSubmit, loading, redirectTo }: Props) {
  // ── States champs ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Validation côté client ──
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

  // ── Soumission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(name.trim(), email.trim(), password);
    } catch (err: any) {
      setError(translateError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  // État de chargement combiné : auth global OU soumission en cours
  const isLoading = loading || submitting;

  // ── Les mots de passe correspondent ──
  const passwordsMatch = confirmPass.length > 0 && password === confirmPass;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Nom complet ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom complet
        </label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mamadou Diallo"
            autoComplete="name"
            className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* ── Email ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse email
        </label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoComplete="email"
            className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* ── Mot de passe ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mot de passe
        </label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 caractères"
            autoComplete="new-password"
            className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          {/* Toggle affichage */}
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            {showPass ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {/* Indicateur de force */}
        <PasswordStrength password={password} />
      </div>

      {/* ── Confirmation mot de passe ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirmer le mot de passe
        </label>
        <div
          className={`flex items-center gap-3 border rounded-xl px-4 transition-all ${
            passwordsMatch
              ? "border-green-400 ring-2 ring-green-100"
              : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Répétez votre mot de passe"
            autoComplete="new-password"
            className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          {/* Icône coche verte si passwords identiques */}
          {passwordsMatch ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              className="flex-shrink-0"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              {showConfirm ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Message d'erreur ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Bouton créer le compte ── */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-colors ${
          isLoading
            ? "bg-blue-300"
            : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl active:scale-[0.98]"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Création du compte...
          </span>
        ) : (
          "Créer mon compte gratuitement"
        )}
      </button>

      {/* ── Séparateur ── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-xs">déjà inscrit ?</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── Lien connexion — garde le redirect ── */}
      <p className="text-center text-sm text-gray-500">
        Vous avez déjà un compte ?{" "}
        <Link
          href={`/login${redirectTo !== "/search" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-blue-700 font-medium hover:text-blue-800 transition-colors"
        >
          Se connecter
        </Link>
      </p>

      {/* ── Continuer sans compte ── */}
      <p className="text-center">
        <Link
          href="/search"
          className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          Continuer sans compte →
        </Link>
      </p>

      {/* ── Mentions légales ── */}
      <p className="text-center text-xs text-gray-400 font-light">
        En créant un compte, vous acceptez nos{" "}
        <span className="underline cursor-pointer">
          Conditions d'utilisation
        </span>{" "}
        et notre{" "}
        <span className="underline cursor-pointer">
          Politique de confidentialité
        </span>
      </p>
    </form>
  );
}
