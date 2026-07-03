"use client";

// ============================================================
// MES DOCUMENTS — /documents/page.tsx
// ============================================================
//
// Espace santé du patient, deux onglets :
//   - Ordonnances : ordonnances reçues des médecins (consulter/imprimer)
//   - Documents   : fichiers déposés par le patient (analyses, imagerie…)
//
// Upload en base64 dans Firestore (voir src/lib/documents.ts).
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  listenPrescriptions,
  listenDocuments,
  uploadDocument,
  deleteDocument,
  openDocument,
  FileTooLargeError,
} from "@/lib/documents";
import {
  Prescription,
  PatientDocument,
  DOCUMENT_CATEGORIES,
  DocumentCategory,
} from "@/types/document";

const catEmoji: Record<string, string> = {
  Analyse: "🧪",
  Imagerie: "🩻",
  "Compte-rendu": "📋",
  Ordonnance: "💊",
  Autre: "📎",
};

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function DocumentsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [tab, setTab] = useState<"prescriptions" | "files">("prescriptions");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);

  // Upload
  const [category, setCategory] = useState<DocumentCategory>("Analyse");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const u1 = listenPrescriptions(user.uid, "patient", setPrescriptions);
    const u2 = listenDocuments(user.uid, setDocuments);
    return () => {
      u1();
      u2();
    };
  }, [user]);

  const handleUpload = async () => {
    if (!user || !file) return;
    setUploading(true);
    setUploadError("");
    try {
      await uploadDocument({
        ownerId: user.uid,
        patientId: user.uid,
        file,
        category,
        label,
      });
      setFile(null);
      setLabel("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      console.error(e);
      setUploadError(
        e instanceof FileTooLargeError
          ? e.message
          : "Échec de l'envoi. Vérifiez le format (PDF/image) et réessayez.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (d: PatientDocument) => {
    if (!confirm(`Supprimer « ${d.name} » ?`)) return;
    try {
      await deleteDocument(d);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Tableau de bord
          </button>
          <span className="font-bold text-blue-900">Mes documents</span>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Espace santé 🗂️</h1>
          <p className="text-gray-400 text-sm mt-1 font-light">
            Vos ordonnances et documents médicaux, au même endroit.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit">
          {[
            { key: "prescriptions", label: "💊 Ordonnances", count: prescriptions.length },
            { key: "files", label: "📎 Documents", count: documents.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-blue-700 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {t.label}
              <span
                className={`ml-2 text-xs ${tab === t.key ? "text-blue-100" : "text-gray-400"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Onglet Ordonnances ── */}
        {tab === "prescriptions" && (
          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="text-4xl mb-3">💊</div>
                <p className="font-medium text-gray-700">Aucune ordonnance</p>
                <p className="text-gray-400 text-sm mt-1">
                  Vos médecins peuvent vous délivrer une ordonnance après une
                  consultation.
                </p>
              </div>
            ) : (
              prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Ordonnance · {p.doctorName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.specialty} · émise le{" "}
                        {new Date(p.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/documents/prescription/${p.id}`)
                      }
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex-shrink-0"
                    >
                      🖨️ Voir / Imprimer
                    </button>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {p.medications.map((m, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex gap-2 items-baseline"
                      >
                        <span className="text-blue-500">•</span>
                        <span>
                          <strong>{m.name}</strong>
                          {m.dosage && ` — ${m.dosage}`}
                          {m.duration && (
                            <span className="text-gray-400"> ({m.duration})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {p.notes && (
                    <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      📝 {p.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Onglet Documents ── */}
        {tab === "files" && (
          <div className="space-y-4">
            {/* Zone d'upload */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                Ajouter un document
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as DocumentCategory)
                  }
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
                >
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {catEmoji[c]} {c}
                    </option>
                  ))}
                </select>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Intitulé (optionnel)"
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-3 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadError && (
                <p className="mt-2 text-xs text-red-500">{uploadError}</p>
              )}
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-3 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {uploading ? "Envoi en cours…" : "Envoyer le document"}
              </button>
              <p className="mt-2 text-[11px] text-gray-400">
                Formats acceptés : PDF (max 700 Ko) et images — les photos
                sont compressées automatiquement.
              </p>
            </div>

            {/* Liste des documents */}
            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="text-4xl mb-3">📂</div>
                <p className="font-medium text-gray-700">Aucun document</p>
                <p className="text-gray-400 text-sm mt-1">
                  Déposez vos analyses, radios ou comptes-rendus.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                      {catEmoji[d.category] || "📎"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {d.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {d.category}
                        {d.size ? ` · ${formatSize(d.size)}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => openDocument(d)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Ouvrir
                    </button>
                    <button
                      onClick={() => handleDelete(d)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}
