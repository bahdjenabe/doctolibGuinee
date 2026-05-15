"use client";

// ============================================================
// DOCTOR DASHBOARD PAGE — src/app/admin/doctor/[id]/dashboard/page.tsx
// ============================================================
//
// Tableau de bord du praticien.
// Gère la logique Firestore et passe les données aux composants.
//
// Composants utilisés :
//   - DoctorDashboardHeader → header avec nom + cloche + navigation
//   - DoctorWelcomeCard     → carte hero avec résumé du jour
//   - DoctorStatsCards      → 4 cartes stats
//   - TodayAppointments     → liste des RDV du jour
//   - RecentActivity        → 5 derniers événements
//   - QuickActions          → raccourcis rapides
//
// Logique :
//   - Charge le médecin depuis Firestore (getDoc)
//   - Écoute les appointments en temps réel (onSnapshot)
//   - Calcule les stats : aujourd'hui, à venir, ce mois, annulés
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import DoctorDashboardHeader from "@/components/dashboardDoctor/DoctorDashboardHeader";
import DoctorWelcomeCard from "@/components/dashboardDoctor/DoctorWelcomeCard";
import DoctorStatsCards from "@/components/dashboardDoctor/DoctorStatsCards";
import QuickActions from "@/components/dashboardDoctor/QuickActions";
import TodayAppointments from "@/components/dashboardDoctor/TodayAppointments";
import RecentActivity from "@/components/dashboardDoctor/RecentActivity";
import ProtectedRoute from "@/components/ProtectedRoute";

// Composants

// ============================================================
// TYPES
// ============================================================

type Doctor = {
  id: string;
  name: string;
  specialty: string;
};

type Appointment = {
  id: string;
  patientName: string;
  date: string;
  status: string;
  cancelledBy?: string;
  createdAt?: any;
};

// ============================================================
// HELPERS
// ============================================================

// Parse la date string en timestamp
const parseDate = (dateStr: string): number => {
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(local).getTime();
};

// Retourne true si la date est aujourd'hui
const isToday = (dateStr: string): boolean => {
  const d = new Date(parseDate(dateStr));
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

// Retourne true si la date est dans le futur
const isUpcoming = (dateStr: string): boolean =>
  parseDate(dateStr) > Date.now();

// Retourne true si la date est ce mois-ci
const isThisMonth = (dateStr: string): boolean => {
  const d = new Date(parseDate(dateStr));
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
};

// ============================================================
// COMPOSANT
// ============================================================

export default function DoctorDashboardPage() {
  const { id } = useParams(); // ID du médecin dans l'URL
  const router = useRouter();

  // ── States ──
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Chargement du médecin ──
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "doctors", id as string));
        if (snap.exists()) {
          const d = snap.data();
          setDoctor({
            id: snap.id,
            name: d.name || "",
            specialty: d.specialty || "",
          });
        }
      } catch (err) {
        console.error("Erreur chargement médecin:", err);
      }
    };
    fetchDoctor();
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

      // Tri par date croissante
      data.sort((a, b) => parseDate(a.date) - parseDate(b.date));

      setAppointments(data);
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  // ── Calcul des stats ──

  // RDV confirmés aujourd'hui
  const todayAppointments = appointments.filter(
    (a) => a.status === "confirmed" && isToday(a.date),
  );

  // RDV confirmés à venir (hors aujourd'hui)
  const upcomingCount = appointments.filter(
    (a) => a.status === "confirmed" && isUpcoming(a.date) && !isToday(a.date),
  ).length;

  // RDV confirmés ce mois (tous statuts confondus)
  const monthCount = appointments.filter(
    (a) => a.status === "confirmed" && isThisMonth(a.date),
  ).length;

  // RDV annulés total
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  // Prochain patient du jour (premier RDV du jour pas encore passé)
  const nextAppt = todayAppointments.find((a) => isUpcoming(a.date));
  const nextPatient = nextAppt?.patientName || null;
  const nextTime = nextAppt
    ? new Date(parseDate(nextAppt.date)).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // ── Loading ──
  if (loading || !doctor) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">
              Chargement du tableau de bord...
            </p>
          </div>
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
        <DoctorDashboardHeader
          doctorId={doctor.id}
          doctorName={doctor.name}
          specialty={doctor.specialty}
        />

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* ── Carte de bienvenue ── */}
          <DoctorWelcomeCard
            doctorName={doctor.name}
            todayCount={todayAppointments.length}
            nextPatient={nextPatient}
            nextTime={nextTime}
          />

          {/* ── Cartes stats ── */}
          <DoctorStatsCards
            todayCount={todayAppointments.length}
            upcomingCount={upcomingCount}
            monthCount={monthCount}
            cancelledCount={cancelledCount}
            totalCount={appointments.length}
          />

          {/* ── Accès rapide ── */}
          <QuickActions doctorId={doctor.id} />

          {/* ── Grille : RDV du jour + activité récente ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RDV du jour */}
            <TodayAppointments
              doctorId={doctor.id}
              appointments={todayAppointments}
            />

            {/* Activité récente */}
            <RecentActivity appointments={appointments} />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
