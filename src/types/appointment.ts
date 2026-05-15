// ============================================================
// TYPES — src/types/dashboard.ts
// Types partagés entre les composants du dashboard patient
// ============================================================

export type Appointment = {
  id:           string;
  doctorId:     string;
  doctorName:   string;
  specialty:    string;
  city:         string;
  date:         string;       // "2026-04-20T09:00:00.000"
  status:       string;       // "confirmed" | "cancelled"
  cancelledBy?: string;       // "doctor" | "patient"
  cancelReason?: string;      // raison si annulé par le médecin
  patientName?:  string;
};

export type Filter = "upcoming" | "past" | "cancelled";