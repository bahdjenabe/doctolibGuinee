// ============================================================
// CRÉNEAUX RÉSERVÉS — src/lib/bookedSlots.ts
// ============================================================
//
// Collection publique "bookedSlots" : un doc par créneau occupé,
// SANS aucune donnée personnelle. Elle permet à la recherche et à
// la fiche médecin d'afficher les disponibilités sans exposer les
// rendez-vous (nom du patient…), dont la lecture est réservée aux
// participants.
//
//   bookedSlots/{doctorId}_{timeMs} { doctorId, time, createdAt }
//
// L'ID déterministe + la règle "création seule" (pas d'update)
// rendent la réservation ATOMIQUE : si deux patients visent le même
// créneau, le second setDoc échoue → détection de conflit fiable.
//
// Cycle de vie :
//   réservation  → reserveSlot()  (avant la création du RDV)
//   annulation   → freeSlot()
//   reprogrammation → reserveSlot(nouveau) puis freeSlot(ancien)
// ============================================================

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeTime } from "@/lib/slots";

// Un créneau occupé, tel qu'exposé publiquement.
export type BookedSlot = {
  doctorId: string;
  time: number; // timestamp ms du début du créneau
};

// ── ID déterministe d'un créneau ──
export function bookedSlotId(doctorId: string, timeMs: number): string {
  return `${doctorId}_${timeMs}`;
}

// ── Réserve un créneau (atomique) ──
// Renvoie true si la réservation a réussi, false si le créneau
// était déjà pris (le doc existait → la règle "create only" refuse).
export async function reserveSlot(
  doctorId: string,
  timeMs: number,
): Promise<boolean> {
  try {
    await setDoc(doc(db, "bookedSlots", bookedSlotId(doctorId, timeMs)), {
      doctorId,
      time: timeMs,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (e: any) {
    if (e?.code === "permission-denied") return false; // déjà pris
    throw e;
  }
}

// ── Libère un créneau (annulation / ancienne date d'une repro) ──
// `date` accepte le format des RDV (string ISO locale ou timestamp).
export async function freeSlot(
  doctorId: string,
  date: string | number,
): Promise<void> {
  const timeMs = typeof date === "number" ? date : normalizeTime(date);
  if (timeMs === null) return;
  try {
    await deleteDoc(doc(db, "bookedSlots", bookedSlotId(doctorId, timeMs)));
  } catch (e) {
    // Le créneau peut déjà être libéré — sans gravité.
    console.warn("[bookedSlots] freeSlot:", e);
  }
}

// ── Écoute temps réel des créneaux pris d'UN médecin ──
export function listenDoctorBookedSlots(
  doctorId: string,
  cb: (times: Set<number>) => void,
) {
  const q = query(
    collection(db, "bookedSlots"),
    where("doctorId", "==", doctorId),
  );
  return onSnapshot(q, (snap) => {
    cb(new Set(snap.docs.map((d) => d.data().time as number)));
  });
}

// ── Écoute temps réel de TOUS les créneaux pris ──
// (page /search : disponibilité du jour pour chaque médecin)
export function listenAllBookedSlots(cb: (slots: BookedSlot[]) => void) {
  return onSnapshot(collection(db, "bookedSlots"), (snap) => {
    cb(
      snap.docs.map((d) => ({
        doctorId: d.data().doctorId as string,
        time: d.data().time as number,
      })),
    );
  });
}
