"use client";

// ============================================================
// DASHBOARD PAGE — src/app/dashboard/page.tsx
// ============================================================
//
// Tableau de bord patient — page principale.
// Gère la logique Firestore et passe les données aux composants.
//
// Composants utilisés :
//   - DashboardHeader      → navbar du dashboard
//   - NextAppointmentCard  → prochain RDV en hero
//   - StatsCards           → 3 cartes À venir / Passés / Annulés
//   - AppointmentList      → liste filtrée des RDV
//   - CancelModal          → modal confirmation annulation
//
// Logique :
//   - Protège la route : si non connecté → /login
//   - Écoute les appointments en temps réel (onSnapshot)
//   - Annulation → updateDoc status:"cancelled" + notifie le médecin
// ============================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// Types + helpers
import { isUpcoming, parseDate } from "@/lib/dashboard";
import { notifyDoctorOfCancellation } from "@/hooks/useNotifications";

// Composants
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import AppointmentList from "@/components/dashboard/AppointmentList";
import CancelModal from "@/components/dashboard/CancelModal";
import NextAppointmentCard from "@/components/dashboard/NextAppointmentcard";
import { Appointment, Filter } from "@/types/appointment";
import ProtectedRoute from "@/components/ProtectedRoute";

// ============================================================
// COMPOSANT
// ============================================================

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  // ── States ──
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [cancelId, setCancelId] = useState<string | null>(null); // ID du RDV à annuler
  const [cancelling, setCancelling] = useState(false);

  // ── Protection de route ──
  // Si non connecté → redirige vers /login
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Écoute temps réel des RDV du patient connecté ──
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Appointment[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Appointment, "id">),
      }));

      // Tri par date décroissante (plus récent en premier)
      data.sort(
        (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime(),
      );

      setAppointments(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // ── Calcul des listes filtrées ──
  const upcoming = appointments.filter(
    (a) => a.status === "confirmed" && isUpcoming(a.date),
  );
  const past = appointments.filter(
    (a) => a.status === "confirmed" && !isUpcoming(a.date),
  );
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  // Liste affichée selon le filtre actif
  const filtered = { upcoming, past, cancelled }[filter];

  // Prochain RDV (le plus proche dans le temps)
  const nextAppointment =
    upcoming.length > 0
      ? upcoming.reduce((closest, a) =>
          parseDate(a.date).getTime() < parseDate(closest.date).getTime()
            ? a
            : closest,
        )
      : null;

  // ── Annulation d'un RDV ──
  const handleCancel = async () => {
    if (!cancelId) return;

    const appt = appointments.find((a) => a.id === cancelId);
    if (!appt) return;

    setCancelling(true);
    try {
      // 1. Met à jour le statut dans Firestore
      await updateDoc(doc(db, "appointments", cancelId), {
        status: "cancelled",
        cancelledBy: "patient",
        cancelledAt: serverTimestamp(),
      });

      // 2. Notifie le médecin (crée un doc dans "notifications")
      await notifyDoctorOfCancellation({
        doctorId: appt.doctorId,
        appointmentId: cancelId,
        patientName: user?.displayName || user?.email || "Un patient",
        doctorName: appt.doctorName,
        date: appt.date,
      });

      setCancelId(null);
    } catch (err) {
      console.error("Erreur annulation:", err);
    } finally {
      setCancelling(false);
    }
  };

  // ── Déconnexion ──
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // ── Loading / Auth ──
  if (authLoading || (!user && !authLoading)) {
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
        {/* ── Header ── */}
        <DashboardHeader
          userName={
            user?.displayName || user?.email?.split("@")[0] || "Patient"
          }
          userId={user?.uid || ""}
          onLogout={handleLogout}
        />

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* ── Salutation ── */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {user?.displayName?.split(" ")[0] || "Cher patient"} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1 font-light">
              Voici un aperçu de votre espace santé
            </p>
          </div>

          {/* ── Prochain RDV ── */}
          <NextAppointmentCard
            appointment={nextAppointment}
            onCancel={setCancelId}
          />

          {/* ── Cartes stats ── */}
          <StatsCards
            upcomingCount={upcoming.length}
            pastCount={past.length}
            cancelledCount={cancelled.length}
            activeFilter={filter}
            onFilter={setFilter}
          />

          {/* ── Liste des RDV ── */}
          <AppointmentList
            appointments={filtered}
            filter={filter}
            loading={loading}
            onFilter={setFilter}
            onCancel={setCancelId}
          />
        </div>

        {/* ── Modal d'annulation ── */}
        {cancelId && (
          <CancelModal
            cancelling={cancelling}
            onConfirm={handleCancel}
            onClose={() => setCancelId(null)}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
