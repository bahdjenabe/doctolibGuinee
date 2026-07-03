// ============================================================
// RAPPELS DE RENDEZ-VOUS — src/lib/reminders.ts
// ============================================================
//
// Génère des rappels AUTOMATIQUES in-app avant un rendez-vous.
//
// ⚠️ Contexte : Firebase client-only (pas de Cloud Functions).
// Les rappels sont donc déclenchés côté client quand le patient
// ouvre son tableau de bord (ou le laisse ouvert). Ils créent des
// notifications dans la collection "notifications" (visibles dans
// la cloche) et sont dédupliqués via des drapeaux sur le RDV.
//
// Deux fenêtres de rappel :
//   - "day"  : le RDV a lieu dans moins de 24h  → drapeau reminded24h
//   - "soon" : le RDV a lieu dans moins de 2h   → drapeau reminded1h
//
// 👉 Pour de VRAIS rappels SMS/e-mail (même app fermée), il faudra
//    une Cloud Function planifiée (plan Blaze) qui parcourt les RDV
//    et appelle un fournisseur SMS/e-mail. La logique de fenêtres
//    ci-dessous est directement réutilisable côté serveur.
// ============================================================

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseDate } from "@/lib/dashboard";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export type ReminderKind = "day" | "soon";

// RDV minimal nécessaire au calcul d'un rappel
type ReminderAppt = {
  id: string;
  doctorName: string;
  date: string;
  status: string;
  reminded24h?: boolean;
  reminded1h?: boolean;
};

// Heure courte : "09:00"
const formatTime = (dateStr: string): string =>
  parseDate(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

// Date courte : "lundi 9 juin à 09:00"
const formatDateShort = (dateStr: string): string => {
  const d = parseDate(dateStr);
  return (
    d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) +
    " à " +
    formatTime(dateStr)
  );
};

// ──────────────────────────────────────────
// getDueReminder
// Retourne la fenêtre de rappel à envoyer pour ce RDV,
// ou null si aucun rappel n'est dû (déjà envoyé, trop tôt, passé).
// ──────────────────────────────────────────
export function getDueReminder(
  appt: ReminderAppt,
  now: number = Date.now(),
): ReminderKind | null {
  if (appt.status !== "confirmed") return null;

  const diff = parseDate(appt.date).getTime() - now;
  if (diff <= 0) return null; // déjà passé

  if (diff <= 2 * HOUR && !appt.reminded1h) return "soon";
  if (diff <= DAY && !appt.reminded24h) return "day";
  return null;
}

// ──────────────────────────────────────────
// sendReminder
// Crée la notification de rappel pour le patient et marque
// le RDV comme rappelé (drapeaux), pour éviter les doublons.
// ──────────────────────────────────────────
export async function sendReminder(
  patientId: string,
  patientName: string,
  appt: ReminderAppt,
  kind: ReminderKind,
) {
  const message =
    kind === "soon"
      ? `⏰ Rappel : votre rendez-vous avec ${appt.doctorName} est dans moins de 2h (${formatTime(appt.date)}).`
      : `⏰ Rappel : votre rendez-vous avec ${appt.doctorName} a lieu ${formatDateShort(appt.date)}.`;

  try {
    // 1. Crée la notification (visible dans la cloche)
    await addDoc(collection(db, "notifications"), {
      recipientId: patientId,
      recipientRole: "patient",
      type: "appointment_reminder",
      message,
      appointmentId: appt.id,
      doctorName: appt.doctorName,
      patientName,
      date: appt.date,
      read: false,
      createdAt: serverTimestamp(),
    });

    // 2. Marque le RDV comme rappelé.
    //    Pour un rappel "soon", on marque aussi "day" : la fenêtre
    //    des 24h est de toute façon dépassée, inutile de la renvoyer.
    await updateDoc(doc(db, "appointments", appt.id), {
      reminded24h: true,
      ...(kind === "soon" ? { reminded1h: true } : {}),
    });
  } catch (err) {
    console.error("[Reminders] Erreur création rappel:", err);
  }
}
