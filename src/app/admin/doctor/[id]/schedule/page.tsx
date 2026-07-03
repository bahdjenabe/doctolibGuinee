"use client";

// ============================================================
// SCHEDULE PAGE — src/app/admin/doctor/[id]/schedule/page.tsx
// ============================================================
//
// Page de gestion des disponibilités hebdomadaires du médecin.
// Gère la logique Firestore et passe les données aux composants.
//
// Composants utilisés :
//   - ScheduleHeader  → header avec nom médecin + navigation
//   - DayCard         → carte d'un jour (plages + ajout + suppression)
//   - ScheduleToast   → notification succès/erreur en haut
//
// Logique :
//   - Charge le workingHours depuis Firestore (getDoc)
//   - Modifications en local → sauvegarde via updateDoc
//   - Après sauvegarde → toast + redirection vers /search
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types
import { WorkingHours, DAYS } from "@/types/schedule";

// Composants
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import DayCard from "@/components/schedule/DayCard";
import ScheduleToast from "@/components/schedule/ScheduleToast";
import DoctorRoute from "@/components/DoctorRoute";

// ============================================================
// COMPOSANT
// ============================================================

export default function SchedulePage() {
  const { id } = useParams(); // ID du médecin dans l'URL
  const router = useRouter();

  // ── States ──
  const [doctorName, setDoctorName] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast de notification
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  // ── Affiche le toast pendant `duration` ms ──
  const showToast = (
    message: string,
    type: "success" | "error",
    duration = 2500,
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  // ── Chargement du médecin depuis Firestore ──
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "doctors", id as string));
        if (snap.exists()) {
          const data = snap.data();
          setDoctorName(data.name || "Médecin");

          // Initialise les horaires depuis Firestore
          // Les jours manquants reçoivent un tableau vide
          const wh: WorkingHours = {};
          DAYS.forEach(({ key }) => {
            wh[key] = Array.isArray(data.workingHours?.[key])
              ? data.workingHours[key].filter((r: any) => typeof r === "string")
              : [];
          });
          setWorkingHours(wh);
        }
      } catch (err) {
        console.error("Erreur chargement médecin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // ── Ajouter une plage à un jour ──
  const handleAdd = (day: string, range: string) => {
    setWorkingHours((prev) => {
      const current = prev[day] || [];
      // Évite les doublons
      if (current.includes(range)) return prev;
      return { ...prev, [day]: [...current, range] };
    });
  };

  // ── Supprimer une plage d'un jour ──
  const handleRemove = (day: string, range: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: prev[day].filter((r) => r !== range),
    }));
  };

  // ── Vider toutes les plages d'un jour ──
  const handleClear = (day: string) => {
    setWorkingHours((prev) => ({ ...prev, [day]: [] }));
  };

  // ── Sauvegarde dans Firestore ──
  // updateDoc modifie uniquement workingHours
  // sans toucher aux autres champs du médecin
  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "doctors", id as string), { workingHours });

      // Toast de succès
      showToast(
        `Disponibilités de ${doctorName} mises à jour !`,
        "success",
        2500,
      );

      // Redirection après 2.5s
      setTimeout(() => router.push("/search"), 2500);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      showToast("Erreur lors de la sauvegarde. Réessayez.", "error", 3500);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">
            Chargement des disponibilités...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <DoctorRoute doctorId={id as string}>
      <main className="min-h-screen bg-gray-50">
        {/* ── Toast en haut ── */}
        <ScheduleToast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
        />

        {/* ── Header ── */}
        <ScheduleHeader doctorId={id as string} doctorName={doctorName} />

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
          {/* ── Carte par jour de la semaine ── */}
          {DAYS.map((day) => (
            <DayCard
              key={day.key}
              day={day}
              ranges={workingHours[day.key] || []}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onClear={handleClear}
            />
          ))}

          {/* ── Bouton de sauvegarde global ── */}
          <button
            disabled={saving}
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-colors ${
              saving
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sauvegarde en cours...
              </span>
            ) : (
              "Sauvegarder les disponibilités"
            )}
          </button>

          {/* Note informative */}
          <p className="text-xs text-center text-gray-400 pb-4">
            Les modifications sont visibles immédiatement sur la page de
            recherche. Les rendez-vous déjà confirmés ne sont pas affectés.
          </p>
        </div>
      </main>
    </DoctorRoute>
  );
}
