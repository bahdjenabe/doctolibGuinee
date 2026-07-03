// ============================================================
// TYPES PROFIL PATIENT — src/types/patient.ts
// ============================================================

export type PatientProfile = {
  uid:        string;
  name:       string;
  email:      string;
  phone?:     string;
  birthDate?: string;   // "1990-05-12"
  gender?:    "" | "F" | "M" | "Autre";
  address?:   string;
  city?:      string;
  preferences?: {
    emailReminders?: boolean;
    smsReminders?:   boolean;
  };
};

export type Beneficiary = {
  id:         string;
  name:       string;
  relation:   string;   // ex: "Enfant", "Conjoint(e)", "Parent"
  birthDate?: string;
};
