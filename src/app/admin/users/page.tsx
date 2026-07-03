// src/app/admin/users/page.tsx
"use client";

// ============================================================
// ADMIN — LISTE DES PATIENTS
// ============================================================
//
// ⚠️ SÉCURITÉ : les règles Firestore restreignent la lecture de
// la collection "patients" au PROPRIÉTAIRE de chaque fiche
// (request.auth.uid == patientId). Lister TOUS les patients exige
// donc un vrai rôle "admin" (custom claim Firebase + règle dédiée),
// non disponible dans ce projet client-only.
//
// Tant que ce rôle n'existe pas, la requête ci-dessous est refusée
// (permission-denied) et la page affiche un message clair au lieu
// d'une erreur muette.
// ============================================================

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminUsersPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // Écoute temps réel de la collection patients
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setDenied(false);
      },
      (err) => {
        // Refusé par les règles Firestore (pas de rôle admin)
        console.error("[Admin] Lecture patients refusée:", err);
        setDenied(true);
      },
    );
    return () => unsubscribe();
  }, []);

  return (
    <ProtectedRoute>
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">
          Patients inscrits ({patients.length})
        </h1>

        {denied ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <p className="font-semibold text-sm">Accès réservé à l&apos;administration</p>
            <p className="text-xs text-amber-600 mt-1">
              La liste des patients nécessite un rôle administrateur. Cette
              fonctionnalité n&apos;est pas activée.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl border flex items-center gap-4"
              >
                {/* Avatar initiales */}
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                  {p.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-gray-500 text-xs">{p.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    {p.role}
                  </span>
                  <p className="text-gray-400 text-xs mt-1">
                    {p.createdAt?.toDate().toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
