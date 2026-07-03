// ============================================================
// TYPES — src/types/review.ts
// Avis laissé par un patient sur un médecin après un RDV passé.
// ============================================================

export type Review = {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  appointmentId: string; // 1 avis par RDV (déduplication)
  rating: number; // note de 1 à 5
  comment: string; // commentaire libre (peut être vide)
  createdAt?: any; // serverTimestamp Firestore
};
