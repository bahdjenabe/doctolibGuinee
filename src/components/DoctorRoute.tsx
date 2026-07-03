"use client";

/**
 * ============================================================
 * DOCTOR ROUTE — src/components/DoctorRoute.tsx
 * ============================================================
 *
 * Garde de PROPRIÉTÉ pour les pages de l'espace médecin
 * (agenda, tableau de bord, horaires).
 *
 * ProtectedRoute vérifie seulement qu'un utilisateur est CONNECTÉ.
 * Ici on vérifie en plus que le connecté est BIEN le médecin
 * identifié par l'URL : `user.uid === doctorId`.
 *
 * POURQUOI uid === doctorId :
 *   Par conception, le `doctorId` stocké sur les rendez-vous et
 *   les notifications est l'UID Firebase Auth du médecin. L'id du
 *   document `doctors/{id}` est donc ce même UID (sinon les
 *   notifications médecin n'arriveraient jamais). La propriété se
 *   ramène donc à comparer l'UID du connecté à l'id de l'URL.
 *
 * Sans ce garde, n'importe quel utilisateur connecté pouvait
 * ouvrir /admin/doctor/<autreId>/... et voir/modifier les données
 * d'un autre médecin en changeant l'id dans l'URL.
 *
 * ⚠️ Sécurité côté CLIENT uniquement (comme ProtectedRoute).
 *    À doubler par des règles Firestore qui n'autorisent l'écriture
 *    sur appointments/doctors qu'au médecin propriétaire.
 * ============================================================
 */

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Props = {
  doctorId: string; // id du médecin attendu (depuis l'URL)
  children: React.ReactNode;
};

export default function DoctorRoute({ doctorId, children }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // ── Vérification en cours (auth Firebase ou id pas encore lu) ──
  if (loading || !doctorId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Vérification...</p>
        </div>
      </main>
    );
  }

  // ── Non connecté → page de connexion (en gardant la destination) ──
  if (!user) {
    if (typeof window !== "undefined") {
      const redirect = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${redirect}`);
    }
    return null;
  }

  // ── Connecté mais PAS le bon médecin → accès refusé ──
  if (user.uid !== doctorId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md w-full p-8 text-center">
          <div className="text-4xl mb-3">🚫</div>
          <h1 className="text-lg font-bold text-gray-900">Accès refusé</h1>
          <p className="text-sm text-gray-500 mt-2">
            Cet espace est réservé au médecin concerné. Vous n&apos;êtes pas
            autorisé à consulter ou modifier ces informations.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
            >
              Mon espace
            </button>
            <button
              onClick={() => router.push("/search")}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Médecin propriétaire → affiche la page ──
  return <>{children}</>;
}
