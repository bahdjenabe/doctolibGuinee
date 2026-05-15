"use client";

// ============================================================
// AGENDA PAGE — src/app/admin/doctor/[id]/agenda/page.tsx
// ============================================================
//
// Page agenda du médecin.
// Gère la logique Firestore et passe les données aux composants.
//
// Composants utilisés :
//   - AgendaHeader           → header avec nom médecin + navigation
//   - AgendaStats            → 4 cartes stats cliquables
//   - AgendaList             → liste des RDV avec onglets
//   - CancelReasonModal      → modal annulation avec raison obligatoire
//   - AgendaToast            → notification succès en haut
//
// Logique :
//   - Charge le médecin depuis Firestore (getDoc)
//   - Écoute les appointments en temps réel (onSnapshot)
//   - Annulation → updateDoc + notifie le patient
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types + helpers
import { Appointment, Doctor, AgendaFilter } from "@/types/agenda";
import { isUpcoming, isToday, parseDate } from "@/lib/agenda";

// Notification au patient quand le médecin annule
import { notifyPatientOfCancellation } from "@/hooks/useNotifications";

// Composants
import AgendaHeader from "@/components/agenda/AgendaHeader";
import AgendaStats from "@/components/agenda/AgendaStats";
import AgendaList from "@/components/agenda/AgendaList";
import CancelReasonModal from "@/components/agenda/CancelReasonModal";
import AgendaToast from "@/components/agenda/AgendaToast";
import ProtectedRoute from "@/components/ProtectedRoute";

// ============================================================
// COMPOSANT
// ============================================================

export default function DoctorAgendaPage() {
  const { id } = useParams(); // ID du médecin dans l'URL
  const router = useRouter();

  // ── States ──
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AgendaFilter>("today");

  // Modal d'annulation
  const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null); // RDV à annuler
  const [cancelling, setCancelling] = useState(false);

  // Toast de confirmation
  const [toast, setToast] = useState({ visible: false, message: "" });

  // ── Fetch médecin ──
  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "doctors", id as string));
      if (snap.exists()) {
        const d = snap.data();
        setDoctor({
          id: snap.id,
          name: d.name || "",
          specialty: d.specialty || "",
        });
      }
    };
    fetch();
  }, [id]);

  // ── Écoute temps réel des appointments du médecin ──
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", id as string),
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Appointment[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Appointment, "id">),
      }));

      // Tri par date croissante (plus proche en premier)
      data.sort(
        (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
      );

      setAppointments(data);
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  // ── Affiche le toast pendant 3 secondes ──
  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  // ── Annulation d'un RDV par le médecin ──
  const handleCancelByDoctor = async (reason: string) => {
    if (!cancelAppt) return;

    setCancelling(true);
    try {
      // 1. Met à jour le statut dans Firestore
      await updateDoc(doc(db, "appointments", cancelAppt.id), {
        status: "cancelled",
        cancelledBy: "doctor",
        cancelReason: reason, // raison choisie par le médecin
        cancelledAt: serverTimestamp(),
      });

      // 2. Notifie le patient (crée un doc dans "notifications")
      // Le patient verra la notification dans sa cloche en temps réel
      if (cancelAppt.patientId) {
        await notifyPatientOfCancellation({
          patientId: cancelAppt.patientId,
          appointmentId: cancelAppt.id,
          patientName: cancelAppt.patientName,
          doctorName: doctor?.name || cancelAppt.doctorName,
          date: cancelAppt.date,
          cancelReason: reason,
        });
      }

      // Ferme la modal
      setCancelAppt(null);

      // Affiche le toast de succès
      showToast(`RDV de ${cancelAppt.patientName} annulé avec succès.`);
    } catch (err) {
      console.error("Erreur annulation:", err);
    } finally {
      setCancelling(false);
    }
  };

  // ── Filtrage des appointments selon l'onglet actif ──
  const getFiltered = (): Appointment[] => {
    switch (filter) {
      case "today":
        return appointments.filter(
          (a) => a.status === "confirmed" && isToday(a.date),
        );
      case "upcoming":
        return appointments.filter(
          (a) =>
            a.status === "confirmed" && isUpcoming(a.date) && !isToday(a.date),
        );
      case "past":
        return appointments.filter(
          (a) => a.status === "confirmed" && !isUpcoming(a.date),
        );
      case "cancelled":
        return appointments.filter((a) => a.status === "cancelled");
      default:
        return [];
    }
  };

  // ── Calcul des compteurs pour les stats ──
  const todayCount = appointments.filter(
    (a) => a.status === "confirmed" && isToday(a.date),
  ).length;
  const upcomingCount = appointments.filter(
    (a) => a.status === "confirmed" && isUpcoming(a.date) && !isToday(a.date),
  ).length;
  const pastCount = appointments.filter(
    (a) => a.status === "confirmed" && !isUpcoming(a.date),
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  // ── Loading ──
  if (!doctor && loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </ProtectedRoute>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        {/* ── Toast de succès en haut ── */}
        <AgendaToast message={toast.message} visible={toast.visible} />

        {/* ── Header ── */}
        {doctor && (
          <AgendaHeader
            doctorId={doctor.id}
            doctorName={doctor.name}
            specialty={doctor.specialty}
          />
        )}

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* ── Cartes stats ── */}
          <AgendaStats
            todayCount={todayCount}
            upcomingCount={upcomingCount}
            pastCount={pastCount}
            cancelledCount={cancelledCount}
            activeFilter={filter}
            onFilter={setFilter}
          />

          {/* ── Liste des RDV ── */}
          <AgendaList
            appointments={getFiltered()}
            filter={filter}
            loading={loading}
            onFilter={setFilter}
            onCancel={setCancelAppt}
          />
        </div>

        {/* ── Modal d'annulation ── */}
        {cancelAppt && (
          <CancelReasonModal
            appointment={cancelAppt}
            cancelling={cancelling}
            onConfirm={handleCancelByDoctor}
            onClose={() => setCancelAppt(null)}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
