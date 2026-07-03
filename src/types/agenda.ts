// ============================================================
// TYPES — src/types/agenda.ts
// Types partagés entre les composants de l'agenda médecin
// ============================================================

export type Appointment = {
  id:           string;
  patientId:    string;
  patientName:  string;
  doctorId:     string;
  doctorName:   string;
  specialty:    string;
  city:         string;
  date:         string;       // "2026-04-20T09:00:00.000"
  status:       string;       // "confirmed" | "cancelled"
  cancelledBy?: string;       // "doctor" | "patient"
  cancelReason?: string;      // raison si annulé par le médecin
  cancelledAt?:  any;
};

export type Doctor = {
  id:        string;
  name:      string;
  specialty: string; 
};

// Filtre actif sur la liste des RDV
export type AgendaFilter =
  | "pending"
  | "today"
  | "upcoming"
  | "past"
  | "cancelled";

// Raisons prédéfinies d'annulation par le médecin
export const CANCEL_REASONS = [
  "Urgence médicale",
  "Maladie du praticien",
  "Déplacement imprévu",
  "Problème technique",
  "Formation ou conférence",
  "Cas grave prioritaire",
  "Autre raison",
];