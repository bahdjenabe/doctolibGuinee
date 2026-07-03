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

// Un document (le fichier est stocké dans Firebase Storage).
export type PatientDocument = {
  id:           string;
  ownerId:      string;   // UID de celui qui a déposé
  patientId:    string;   // dossier médical concerné
  name:         string;
  category:     DocumentCategory;
  fileUrl:      string;
  storagePath:  string;
  size?:        number;
  contentType?: string;
  createdAt?:   any;
};
