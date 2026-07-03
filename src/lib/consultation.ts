// ============================================================
// HELPERS TÉLÉCONSULTATION — src/lib/consultation.ts
// ============================================================
//
// Modèle Firestore — collection "consultations" :
//   consultations/{appointmentId} {
//     participantIds: [patientId, doctorId]   // UID Auth
//     offer?:  { type, sdp }                  // signalisation WebRTC
//     answer?: { type, sdp }
//     startedAt?, endedAt?
//   }
//   + sous-collections callerCandidates / calleeCandidates (ICE)
//
// Le patient joue le rôle "appelant" (crée l'offre), le médecin
// "appelé" (crée la réponse). La signalisation transite par Firestore.
//
// ⚠️ En production, ajouter un serveur TURN (au-delà du STUN Google)
//    pour que la connexion aboutisse à travers les NAT stricts.
// ============================================================

import { parseDate } from "@/lib/dashboard";

// Serveurs STUN publics de Google (traversée NAT basique).
export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

// Fenêtre pendant laquelle on peut rejoindre une téléconsultation :
// de 15 min avant l'heure du RDV jusqu'à 60 min après.
const JOIN_BEFORE_MS = 15 * 60 * 1000;
const JOIN_AFTER_MS = 60 * 60 * 1000;

export function joinWindow(dateStr: string): {
  open: boolean;
  tooEarly: boolean;
  tooLate: boolean;
  minutesUntil: number;
} {
  const start = parseDate(dateStr).getTime();
  const now = Date.now();
  const opensAt = start - JOIN_BEFORE_MS;
  const closesAt = start + JOIN_AFTER_MS;
  return {
    open: now >= opensAt && now <= closesAt,
    tooEarly: now < opensAt,
    tooLate: now > closesAt,
    minutesUntil: Math.max(0, Math.round((opensAt - now) / 60000)),
  };
}

// Un RDV est-il une téléconsultation ?
export function isVideoAppointment(type?: string): boolean {
  return type === "video";
}
