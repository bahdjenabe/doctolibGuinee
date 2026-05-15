// ============================================================
// TYPES — src/types/schedule.ts
// Types partagés entre les composants de la page schedule
// ============================================================

// workingHours : objet avec les jours en clés
// ex: { monday: ["08:00-12:00", "14:00-18:00"], tuesday: [] }
export type WorkingHours = {
  [day: string]: string[];
};

// Un jour de la semaine avec son label français
export type Day = {
  key:   string; // "monday", "tuesday"... (clé Firestore)
  label: string; // "Lundi", "Mardi"...
};

// Liste des jours dans l'ordre
export const DAYS: Day[] = [
  { key: "monday",    label: "Lundi"    },
  { key: "tuesday",   label: "Mardi"    },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday",  label: "Jeudi"    },
  { key: "friday",    label: "Vendredi" },
  { key: "saturday",  label: "Samedi"   },
  { key: "sunday",    label: "Dimanche" },
];

// Plages horaires prédéfinies pour une saisie rapide
export const PRESET_RANGES = [
  "07:00-12:00",
  "08:00-12:00",
  "08:00-13:00",
  "14:00-18:00",
  "14:00-17:00",
  "15:00-19:00",
];