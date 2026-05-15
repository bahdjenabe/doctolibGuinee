"use client";

/**
 * ============================================================
 * GUEST ROUTE — src/components/GuestRoute.tsx
 * ============================================================
 *
 * Composant inverse de ProtectedRoute.
 * Redirige les utilisateurs DÉJÀ CONNECTÉS vers /search.
 * Utilisé sur les pages /login et /register.
 *
 * UTILISATION :
 *
 *   // Page login → redirige vers /search si déjà connecté
 *   export default function LoginPage() {
 *     return (
 *       <GuestRoute>
 *         <LoginForm />
 *       </GuestRoute>
 *     );
 *   }
 * ============================================================
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // URL de redirection après login (ex: /doctor/abc?date=123)
  const redirectTo = searchParams.get("redirect") || "/search";

  useEffect(() => {
    // Si déjà connecté → redirige vers la destination prévue
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // ── Chargement ──
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Déjà connecté → ne rien afficher (redirection en cours) ──
  if (user) return null;

  // ── Non connecté → affiche la page ──
  return <>{children}</>;
}
