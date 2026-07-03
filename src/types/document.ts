// ============================================================
// TYPES DOCUMENTS & ORDONNANCES — src/types/document.ts
// ============================================================

// Un médicament d'une ordonnance.
export type Medication = {
  name:         string;   // ex: "Paracétamol 500 mg"
  dosage:       string;   // ex: "1 comprimé 3x/jour"
  duration:     string;   // ex: "5 jours"
  instructions?: string;  // ex: "Après les repas"
};

// Une ordonnance rédigée par un médecin.
export type Prescription = {
  id:             string;
  doctorId:       string;
  doctorName:     string;
  specialty?:     string;
  patientId:      string;
  patientName:    string;
  appointmentId?: string;
  date:           string;        // date d'émission (ISO string)
  medications:    Medication[];
  notes?:         string;
  createdAt?:     any;
};

// Catégories de documents patients.
export const DOCUMENT_CATEGORIES = [
  "Analyse",
  "Imagerie",
  "Compte-rendu",
  "Ordonnance",
  "Autre",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

// Un document déposé par le patient.
// Le fichier est stocké en base64 (dataUrl) directement dans Firestore
// (Firebase Storage nécessite le forfait Blaze, non activé pour l'instant).
// Limite Firestore : 1 Mo par document → fichier source ≤ ~700 Ko.
export type PatientDocument = {
  id:           string;
  ownerId:      string;   // UID de celui qui a déposé
  patientId:    string;   // dossier médical concerné
  name:         string;
  category:     DocumentCategory;
  dataUrl?:     string;   // fichier encodé en base64 (data:...)
  fileUrl?:     string;   // héritage Storage (non utilisé actuellement)
  storagePath?: string;   // héritage Storage (non utilisé actuellement)
  size?:        number;
  contentType?: string;
  createdAt?:   any;
};
