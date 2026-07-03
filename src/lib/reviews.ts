// ============================================================
// AVIS MÉDECINS — src/lib/reviews.ts
// Helpers pour créer un avis et calculer une moyenne.
// ============================================================

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Review } from "@/types/review";

// ──────────────────────────────────────────
// submitReview
// Crée un avis patient → médecin dans la collection "reviews",
// puis met à jour l'agrégat (note moyenne + nb d'avis) du médecin.
// (1 avis par RDV : garde anti-doublon côté serveur en plus de l'UI.)
// ──────────────────────────────────────────
export async function submitReview(params: {
  doctorId: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  rating: number;
  comment: string;
}) {
  // Garde anti-doublon : un seul avis par RDV.
  const dupSnap = await getDocs(
    query(
      collection(db, "reviews"),
      where("appointmentId", "==", params.appointmentId),
    ),
  );
  if (!dupSnap.empty) {
    throw new Error("REVIEW_ALREADY_EXISTS");
  }

  await addDoc(collection(db, "reviews"), {
    doctorId: params.doctorId,
    patientId: params.patientId,
    patientName: params.patientName,
    appointmentId: params.appointmentId,
    rating: params.rating,
    comment: params.comment.trim(),
    createdAt: serverTimestamp(),
  });

  // Met à jour la note affichée dans la recherche (collection "doctors").
  await recomputeDoctorRating(params.doctorId);
}

// ──────────────────────────────────────────
// recomputeDoctorRating
// Recalcule la note moyenne et le nombre d'avis d'un médecin à partir
// de la collection "reviews", puis écrit le résultat sur "doctors/{id}".
// Sert à garder la fiche ET la liste de recherche à jour.
// ──────────────────────────────────────────
export async function recomputeDoctorRating(doctorId: string) {
  const snap = await getDocs(
    query(collection(db, "reviews"), where("doctorId", "==", doctorId)),
  );
  const reviews = snap.docs.map((d) => d.data() as Review);

  try {
    await updateDoc(doc(db, "doctors", doctorId), {
      rating: averageRating(reviews),
      reviews: reviews.length,
    });
  } catch (err) {
    // Non bloquant : l'avis est créé même si l'agrégat échoue.
    console.error("[Reviews] Erreur mise à jour note médecin:", err);
  }
}

// ──────────────────────────────────────────
// averageRating
// Moyenne (arrondie à 0,1) d'une liste d'avis. 0 si aucun.
// ──────────────────────────────────────────
export function averageRating(reviews: Review[]): number {
  const ratings = reviews
    .map((r) => Number(r.rating) || 0)
    .filter((r) => r > 0);
  if (ratings.length === 0) return 0;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return Math.round(avg * 10) / 10;
}
