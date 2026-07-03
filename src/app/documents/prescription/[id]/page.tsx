"use client";

// ============================================================
// ORDONNANCE — VUE IMPRIMABLE — /documents/prescription/[id]
// ============================================================
//
// Rendu type A4 d'une ordonnance, avec bouton d'impression.
// Accessible au patient concerné et au médecin émetteur.
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Prescription } from "@/types/document";

function PrescriptionView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [p, setP] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "prescriptions", id as string));
        if (!snap.exists()) {
          setDenied(true);
          return;
        }
        const data = { id: snap.id, ...(snap.data() as any) } as Prescription;
        if (data.patientId !== user.uid && data.doctorId !== user.uid) {
          setDenied(true);
          return;
        }
        setP(data);
      } catch (e) {
        console.error(e);
        setDenied(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (denied || !p) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-100 px-6 text-center">
        <div className="text-4xl">🔒</div>
        <p className="font-medium text-gray-700">Ordonnance introuvable</p>
        <button
          onClick={() => router.push("/documents")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour à mes documents
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Barre d'actions — masquée à l'impression */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={() => router.push("/documents")}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Retour
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      {/* Feuille d'ordonnance */}
      <div className="max-w-2xl mx-auto bg-white shadow-sm print:shadow-none rounded-lg print:rounded-none p-10 border border-gray-200 print:border-0">
        {/* En-tête praticien */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div>
            <p className="text-lg font-bold text-gray-900">{p.doctorName}</p>
            <p className="text-sm text-blue-700">{p.specialty}</p>
            <p className="text-xs text-gray-400 mt-1">Doctolib Guinée</p>
          </div>
          <div className="text-right">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center ml-auto">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(p.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Patient */}
        <div className="mt-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Patient
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {p.patientName}
          </p>
        </div>

        {/* Titre */}
        <h1 className="text-center text-xl font-bold text-gray-900 mt-8 mb-6 tracking-wide">
          ORDONNANCE
        </h1>

        {/* Médicaments */}
        <ol className="space-y-4">
          {p.medications.map((m, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-gray-400 font-medium">{i + 1}.</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-600">
                  {m.dosage}
                  {m.duration && ` — pendant ${m.duration}`}
                </p>
                {m.instructions && (
                  <p className="text-xs text-gray-400 italic">
                    {m.instructions}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {p.notes && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Remarques
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {p.notes}
            </p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <div className="w-40 border-b border-gray-300" />
            <p className="text-xs text-gray-400 mt-1">
              Signature et cachet du praticien
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-gray-300">
          Ordonnance émise via Doctolib Guinée · Document à présenter en
          pharmacie
        </p>
      </div>
    </main>
  );
}

export default function PrescriptionPrintPage() {
  return (
    <ProtectedRoute>
      <PrescriptionView />
    </ProtectedRoute>
  );
}
