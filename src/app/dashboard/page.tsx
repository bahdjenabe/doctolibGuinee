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

import { useEffect, useRef, useState } from "react";
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
import { reserveSlot, freeSlot } from "@/lib/bookedSlots";

// Types + helpers
import { isUpcoming, parseDate } from "@/lib/dashboard";
import { getDueReminder, sendReminder } from "@/lib/reminders";
import { submitReview } from "@/lib/reviews";
import {
  notifyDoctorOfCancellation,
  notifyDoctorOfReschedule,
} from "@/hooks/useNotifications";

// Composants
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import AppointmentList from "@/components/dashboard/AppointmentList";
import CancelModal from "@/components/dashboard/CancelModal";
import RescheduleModal from "@/components/dashboard/RescheduleModal";
import NextAppointmentCard from "@/components/dashboard/NextAppointmentcard";
import ReminderBanner from "@/components/dashboard/ReminderBanner";
import ReviewModal from "@/components/dashboard/ReviewModal";
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
  const [rescheduleId, setRescheduleId] = useState<string | null>(null); // RDV à reprogrammer
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  // Rappels déjà déclenchés pendant cette session (clé: "apptId:kind")
  // Évite les doublons avant que les drapeaux Firestore ne se propagent.
  const remindedRef = useRef<Set<string>>(new Set());

  // Avis
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set()); // RDV déjà notés
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null); // RDV à noter
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

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

  // ── Écoute des avis déjà laissés par le patient ──
  // Sert à savoir quels RDV passés ont déjà été notés.
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "reviews"),
      where("patientId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      setReviewedIds(
        new Set(snap.docs.map((d) => d.data().appointmentId as string)),
      );
    });

    return () => unsub();
  }, [user]);

  // ── Rappels automatiques avant RDV ──
  // À l'ouverture du dashboard et toutes les 5 min tant qu'il est ouvert,
  // on génère les rappels dus (J-1 et imminent ≤2h). Déduplication via
  // le ref de session + les drapeaux Firestore (voir lib/reminders.ts).
  useEffect(() => {
    if (!user) return;

    const patientName = user.displayName || user.email || "Patient";

    const run = () => {
      appointments.forEach((a) => {
        const kind = getDueReminder(a as any);
        if (!kind) return;

        const key = `${a.id}:${kind}`;
        if (remindedRef.current.has(key)) return;
        remindedRef.current.add(key); // marque tout de suite (optimiste)

        sendReminder(user.uid, patientName, a as any, kind);
      });
    };

    run();
    const interval = setInterval(run, 5 * 60 * 1000); // toutes les 5 min
    return () => clearInterval(interval);
  }, [appointments, user]);

  // ── Calcul des listes filtrées ──
  // "À venir" regroupe les RDV confirmés ET les demandes en attente
  // (pending) à venir, pour que le patient suive ses demandes.
  const upcoming = appointments.filter(
    (a) =>
      (a.status === "confirmed" || a.status === "pending") &&
      isUpcoming(a.date),
  );
  const past = appointments.filter(
    (a) => a.status === "confirmed" && !isUpcoming(a.date),
  );
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  // Liste affichée selon le filtre actif
  const filtered = { upcoming, past, cancelled }[filter];

  // Prochain RDV en hero : uniquement un RDV CONFIRMÉ (une demande en
  // attente n'est pas encore un rendez-vous garanti).
  const confirmedUpcoming = upcoming.filter((a) => a.status === "confirmed");
  const nextAppointment =
    confirmedUpcoming.length > 0
      ? confirmedUpcoming.reduce((closest, a) =>
          parseDate(a.date).getTime() < parseDate(closest.date).getTime()
            ? a
            : closest,
        )
      : null;

  // RDV imminent (≤ 24h) → bannière de rappel
  const imminentAppointment =
    nextAppointment &&
    parseDate(nextAppointment.date).getTime() - Date.now() <=
      24 * 60 * 60 * 1000
      ? nextAppointment
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

      // 1 bis. Libère le créneau public (bookedSlots)
      await freeSlot(appt.doctorId, appt.date);

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

  // ── Reprogrammation d'un RDV ──
  // Met à jour la date du RDV existant (l'ancien créneau est libéré
  // automatiquement). Le paiement n'est pas redemandé.
  const handleReschedule = async (newSlot: number) => {
    if (!rescheduleId) return;

    const appt = appointments.find((a) => a.id === rescheduleId);
    if (!appt) return;

    setRescheduling(true);
    setRescheduleError("");

    try {
      // Refus d'un créneau passé (sécurité)
      if (newSlot < Date.now()) {
        setRescheduleError("Ce créneau est déjà passé. Choisissez-en un autre.");
        setRescheduling(false);
        return;
      }

      // Construit la date au même format que la création de RDV
      const d = new Date(newSlot);
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateString =
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000`;

      // Réservation ATOMIQUE du nouveau créneau (bookedSlots).
      const reserved = await reserveSlot(appt.doctorId, newSlot);
      if (!reserved) {
        setRescheduleError("Ce créneau vient d'être pris. Choisissez-en un autre.");
        setRescheduling(false);
        return;
      }

      // Conserve l'ancienne date pour la notification
      const oldDate = appt.date;

      // Met à jour la date du RDV
      try {
        await updateDoc(doc(db, "appointments", rescheduleId), {
          date: dateString,
          rescheduledAt: serverTimestamp(),
        });
      } catch (err) {
        // Échec → on libère le créneau qu'on venait de réserver.
        await freeSlot(appt.doctorId, newSlot);
        throw err;
      }

      // Libère l'ancien créneau
      await freeSlot(appt.doctorId, oldDate);

      // Notifie le médecin du changement de créneau
      await notifyDoctorOfReschedule({
        doctorId: appt.doctorId,
        appointmentId: rescheduleId,
        patientName: user?.displayName || user?.email || "Un patient",
        doctorName: appt.doctorName,
        oldDate,
        newDate: dateString,
      });

      setRescheduleId(null);
    } catch (err) {
      console.error("Erreur reprogrammation:", err);
      setRescheduleError("Une erreur est survenue. Réessayez.");
    } finally {
      setRescheduling(false);
    }
  };

  // ── Soumission d'un avis ──
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewAppt || !user) return;

    setSubmittingReview(true);
    setReviewError("");

    try {
      await submitReview({
        doctorId: reviewAppt.doctorId,
        patientId: user.uid,
        patientName: user.displayName || user.email || "Patient",
        appointmentId: reviewAppt.id,
        rating,
        comment,
      });
      setReviewAppt(null);
    } catch (err: any) {
      console.error("Erreur avis:", err);
      setReviewError(
        err?.message === "REVIEW_ALREADY_EXISTS"
          ? "Vous avez déjà laissé un avis pour ce rendez-vous."
          : "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setSubmittingReview(false);
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

          {/* ── Bannière de rappel (RDV ≤ 24h) ── */}
          <ReminderBanner appointment={imminentAppointment} />

          {/* ── Prochain RDV ── */}
          <NextAppointmentCard
            appointment={nextAppointment}
            onCancel={setCancelId}
            onReschedule={setRescheduleId}
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
            onReschedule={setRescheduleId}
            reviewedIds={reviewedIds}
            onReview={setReviewAppt}
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

        {/* ── Modal de reprogrammation ── */}
        {rescheduleId &&
          (() => {
            const appt = appointments.find((a) => a.id === rescheduleId);
            if (!appt) return null;
            return (
              <RescheduleModal
                appointment={appt}
                rescheduling={rescheduling}
                error={rescheduleError}
                onConfirm={handleReschedule}
                onClose={() => {
                  setRescheduleId(null);
                  setRescheduleError("");
                }}
              />
            );
          })()}

        {/* ── Modal d'avis ── */}
        {reviewAppt && (
          <ReviewModal
            appointment={reviewAppt}
            submitting={submittingReview}
            error={reviewError}
            onConfirm={handleSubmitReview}
            onClose={() => {
              setReviewAppt(null);
              setReviewError("");
            }}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
