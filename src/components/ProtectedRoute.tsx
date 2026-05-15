"use client";

/**
 * ============================================================
 * PROTECTED ROUTE — src/components/ProtectedRoute.tsx
 * ============================================================
 *
 * Composant de protection côté CLIENT (backup du middleware).
 * À utiliser dans les pages protégées pour une double sécurité.
 *
 * Le middleware gère la redirection côté serveur.
 * Ce composant gère la redirection côté client (fallback).
 *
 * UTILISATION :
 *
 *   // Page dashboard → accessible uniquement aux connectés
 *   export default function DashboardPage() {
 *     return (
 *       <ProtectedRoute>
 *         <DashboardContent />
 *       </ProtectedRoute>
 *     );
 *   }
 *
 *   // Page admin → accessible uniquement aux connectés
 *   export default function AgendaPage() {
 *     return (
 *       <ProtectedRoute redirectTo="/login">
 *         <AgendaContent />
 *       </ProtectedRoute>
 *     );
 *   }
 * ============================================================
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Props = {
  children: React.ReactNode;
  redirectTo?: string; // où rediriger si non connecté (défaut: /login)
};

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
}: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Attend que Firebase vérifie l'état de connexion
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // ── Écran de chargement pendant la vérification ──
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Vérification...</p>
        </div>
      </main>
    );
  }

  // ── Non connecté → ne rien afficher (redirection en cours) ──
  if (!user) return null;

  // ── Connecté → affiche le contenu ──
  return <>{children}</>;
}
