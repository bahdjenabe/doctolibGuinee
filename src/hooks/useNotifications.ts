/**
 * ============================================================
 * HOOK useNotifications — src/hooks/useNotifications.ts
 * ============================================================
 *
 * CORRECTIONS APPORTÉES :
 *
 * 1. SUPPRESSION du orderBy("createdAt", "desc")
 *    → Firestore exige un index composite pour combiner
 *      where() + orderBy() sur des champs différents.
 *      Sans créer l'index dans la console Firebase, la
 *      requête échoue silencieusement → aucune notification.
 *      On trie maintenant côté client (plus simple).
 *
 * 2. AJOUT de logs console pour déboguer facilement
 *    → Ouvre F12 → Console pour voir si les notifications
 *      arrivent bien dans Firestore.
 *
 * ─────────────────────────────────────────────────────────────
 * STRUCTURE Firestore — collection "notifications"
 * ─────────────────────────────────────────────────────────────
 * {
 *   recipientId:   string    → UID Firebase Auth du destinataire
 *   recipientRole: string    → "patient" | "doctor"
 *   type:          string    → "appointment_cancelled_by_patient"
 *                           |  "appointment_cancelled_by_doctor"
 *   message:       string    → texte lisible
 *   appointmentId: string
 *   doctorName:    string
 *   patientName:   string
 *   date:          string
 *   cancelReason?: string
 *   read:          boolean   → false par défaut
 *   createdAt:     Timestamp → serverTimestamp()
 * }
 * ============================================================
 */

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ============================================================
// TYPE
// ============================================================

export type Notification = {
  id:            string;
  recipientId:   string;
  recipientRole: string;
  type:          string;
  message:       string;
  appointmentId: string;
  doctorName:    string;
  patientName:   string;
  date:          string;
  cancelReason?: string;
  read:          boolean;
  createdAt?:    any;
};

// ============================================================
// HOOK — useNotifications
// ============================================================

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    // Si pas de userId → pas de notifications à charger
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log("[Notifications] Écoute pour userId:", userId);

    // ⚠️ PAS de orderBy ici — Firestore exige un index composite
    // pour where() + orderBy() → on trie côté client à la place
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("[Notifications] Reçu:", snapshot.docs.length, "notifications");

        const data: Notification[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Notification, "id">),
        }));

        // Tri par date décroissante côté client
        // (évite l'index composite Firestore)
        data.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
          const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        });

        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        // Affiche l'erreur dans la console pour déboguer
        console.error("[Notifications] Erreur onSnapshot:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Marque toutes comme lues
  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      try {
        await updateDoc(doc(db, "notifications", notif.id), { read: true });
      } catch (err) {
        console.error("[Notifications] Erreur markAllAsRead:", err);
      }
    }
  };

  // Marque une seule comme lue
  const markOneAsRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { read: true });
    } catch (err) {
      console.error("[Notifications] Erreur markOneAsRead:", err);
    }
  };

  return { notifications, unreadCount, loading, markAllAsRead, markOneAsRead };
}

// ============================================================
// HELPER — formatage date court pour les messages
// ============================================================

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return "";
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  const d = new Date(local);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    + " à " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ============================================================
// FONCTION — notifyDoctorOfCancellation
// Appelée quand un PATIENT annule → notifie le MÉDECIN
//
// ⚠️ IMPORTANT : doctorId doit être l'UID Firebase Auth
// du médecin (pas l'ID Firestore du document doctor).
// Si le médecin n'a pas de compte Auth, cette notification
// ne peut pas lui être délivrée via ce système.
// ============================================================

export async function notifyDoctorOfCancellation({
  doctorId,
  appointmentId,
  patientName,
  doctorName,
  date,
}: {
  doctorId:      string;
  appointmentId: string;
  patientName:   string;
  doctorName:    string;
  date:          string;
}) {
  try {
    console.log("[Notifications] Création notif pour médecin:", doctorId);

    await addDoc(collection(db, "notifications"), {
      recipientId:   doctorId,       // UID Auth du médecin
      recipientRole: "doctor",
      type:          "appointment_cancelled_by_patient",
      message:       `${patientName} a annulé son rendez-vous du ${formatDateShort(date)}.`,
      appointmentId,
      doctorName,
      patientName,
      date,
      cancelReason:  "Annulé par le patient",
      read:          false,
      createdAt:     serverTimestamp(),
    });

    console.log("[Notifications] Notif médecin créée ✓");
  } catch (err) {
    console.error("[Notifications] Erreur création notif médecin:", err);
  }
}

// ============================================================
// FONCTION — notifyDoctorOfNewRequest
// Appelée quand un PATIENT réserve → notifie le MÉDECIN qu'une
// nouvelle demande de RDV est EN ATTENTE de sa validation.
// ============================================================

export async function notifyDoctorOfNewRequest({
  doctorId,
  appointmentId,
  patientName,
  doctorName,
  date,
}: {
  doctorId:      string;
  appointmentId: string;
  patientName:   string;
  doctorName:    string;
  date:          string;
}) {
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId:   doctorId,       // UID Auth du médecin
      recipientRole: "doctor",
      type:          "appointment_requested",
      message:       `${patientName} souhaite réserver un rendez-vous le ${formatDateShort(date)}. À confirmer.`,
      appointmentId,
      doctorName,
      patientName,
      date,
      read:          false,
      createdAt:     serverTimestamp(),
    });
  } catch (err) {
    console.error("[Notifications] Erreur création notif demande RDV:", err);
  }
}

// ============================================================
// FONCTION — notifyPatientOfConfirmation
// Appelée quand un MÉDECIN confirme une demande → notifie le PATIENT
// que son rendez-vous est validé.
// ============================================================

export async function notifyPatientOfConfirmation({
  patientId,
  appointmentId,
  patientName,
  doctorName,
  date,
}: {
  patientId:     string;
  appointmentId: string;
  patientName:   string;
  doctorName:    string;
  date:          string;
}) {
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId:   patientId,      // UID Auth du patient
      recipientRole: "patient",
      type:          "appointment_confirmed",
      message:       `✅ ${doctorName} a confirmé votre rendez-vous du ${formatDateShort(date)}.`,
      appointmentId,
      doctorName,
      patientName,
      date,
      read:          false,
      createdAt:     serverTimestamp(),
    });
  } catch (err) {
    console.error("[Notifications] Erreur création notif confirmation:", err);
  }
}

// ============================================================
// FONCTION — notifyDoctorOfReschedule
// Appelée quand un PATIENT reprogramme → notifie le MÉDECIN
// avec l'ancien et le nouveau créneau.
// ============================================================

export async function notifyDoctorOfReschedule({
  doctorId,
  appointmentId,
  patientName,
  doctorName,
  oldDate,
  newDate,
}: {
  doctorId:      string;
  appointmentId: string;
  patientName:   string;
  doctorName:    string;
  oldDate:       string;
  newDate:       string;
}) {
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId:   doctorId,       // UID Auth du médecin
      recipientRole: "doctor",
      type:          "appointment_rescheduled_by_patient",
      message:       `${patientName} a reprogrammé son rendez-vous du ${formatDateShort(oldDate)} au ${formatDateShort(newDate)}.`,
      appointmentId,
      doctorName,
      patientName,
      date:          newDate,
      read:          false,
      createdAt:     serverTimestamp(),
    });
  } catch (err) {
    console.error("[Notifications] Erreur création notif reprogrammation:", err);
  }
}

// ============================================================
// FONCTION — notifyPatientOfCancellation
// Appelée quand un MÉDECIN annule → notifie le PATIENT
//
// ⚠️ patientId doit être l'UID Firebase Auth du patient.
// C'est bien le cas car on le stocke lors du addDoc RDV.
// ============================================================

export async function notifyPatientOfCancellation({
  patientId,
  appointmentId,
  patientName,
  doctorName,
  date,
  cancelReason,
}: {
  patientId:     string;
  appointmentId: string;
  patientName:   string;
  doctorName:    string;
  date:          string;
  cancelReason:  string;
}) {
  try {
    console.log("[Notifications] Création notif pour patient:", patientId);

    await addDoc(collection(db, "notifications"), {
      recipientId:   patientId,      // UID Auth du patient
      recipientRole: "patient",
      type:          "appointment_cancelled_by_doctor",
      message:       `${doctorName} a annulé votre rendez-vous du ${formatDateShort(date)}. Raison : ${cancelReason}.`,
      appointmentId,
      doctorName,
      patientName,
      date,
      cancelReason,
      read:          false,
      createdAt:     serverTimestamp(),
    });

    console.log("[Notifications] Notif patient créée ✓");
  } catch (err) {
    console.error("[Notifications] Erreur création notif patient:", err);
  }
}