// ============================================================
// HELPERS — src/lib/slots.ts
// Fonctions utilitaires pour la gestion des créneaux
// Utilisées par SlotSidebar, DayStrip et SlotGrid
// ============================================================

const SLOT_DURATION = 30; // durée d'un créneau en minutes

const DAY_NAMES_EN = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
];

// ──────────────────────────────────────────
// generateSlots
// Génère tous les créneaux de 30 min pour une date donnée
// depuis les plages horaires Firestore (ex: ["08:00-12:00"])
// ──────────────────────────────────────────
export function generateSlots(dateStr: string, ranges: string[]): number[] {
  const slots: number[] = [];

  const valid = (ranges || []).filter(
    (r) => typeof r === "string" && r.includes("-") && r.trim() !== ""
  );

  for (const range of valid) {
    const [start, end] = range.split("-");
    if (!start || !end) continue;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if ([sh, sm, eh, em].some(isNaN)) continue;

    // T00:00:00 évite les décalages de fuseau horaire
    const base = new Date(dateStr + "T00:00:00");
    base.setHours(sh, sm, 0, 0);

    const endMs = new Date(dateStr + "T00:00:00");
    endMs.setHours(eh, em, 0, 0);

    let cur = base.getTime();
    while (cur + SLOT_DURATION * 60000 <= endMs.getTime()) {
      slots.push(cur);
      cur += SLOT_DURATION * 60000;
    }
  }

  return slots;
}

// ──────────────────────────────────────────
// slotsByPeriod
// Sépare les créneaux en matin (< 13h) et après-midi (>= 13h)
// ──────────────────────────────────────────
export function slotsByPeriod(slots: number[]) {
  return {
    matin:     slots.filter((s) => new Date(s).getHours() < 13),
    apresmidi: slots.filter((s) => new Date(s).getHours() >= 13),
  };
}

// ──────────────────────────────────────────
// countAvailable
// Compte les créneaux libres pour un jour donné
// (utilisé pour afficher "8 dispo" dans DayStrip)
// ──────────────────────────────────────────
export function countAvailable(
  dateStr: string,
  workingHours: Record<string, string[]>,
  bookedSet: Set<number>
): number {
  const dn = DAY_NAMES_EN[new Date(dateStr + "T12:00:00").getDay()];
  const ranges = workingHours[dn] || [];
  return generateSlots(dateStr, ranges).filter((s) => !bookedSet.has(s)).length;
}

// ──────────────────────────────────────────
// normalizeTime
// Convertit la date d'un appointment en timestamp number
// Gère : Firestore Timestamp, string ISO avec/sans "Z", number
// ──────────────────────────────────────────
export function normalizeTime(date: any): number | null {
  if (!date) return null;
  if (typeof date?.toDate === "function") return date.toDate().getTime();
  if (typeof date === "string") {
    const local = date.endsWith("Z") ? date.slice(0, -1) : date;
    const ms = new Date(local).getTime();
    return isNaN(ms) ? null : ms;
  }
  if (typeof date === "number") return date;
  return null;
}

// ──────────────────────────────────────────
// cleanWorkingHours
// Nettoie le workingHours venant de Firestore
// Garantit que chaque jour est un tableau de strings valides
// ──────────────────────────────────────────
export function cleanWorkingHours(raw: any): Record<string, string[]> {
  if (!raw || typeof raw !== "object") return {};
  const clean: Record<string, string[]> = {};
  Object.keys(raw).forEach((day) => {
    clean[day] = Array.isArray(raw[day])
      ? raw[day].filter((r: any) => typeof r === "string" && r.includes("-"))
      : [];
  });
  return clean;
}

// ──────────────────────────────────────────
// getDayName
// Retourne le nom du jour en anglais depuis une date string
// ──────────────────────────────────────────
export function getDayName(dateStr: string): string {
  return DAY_NAMES_EN[new Date(dateStr + "T12:00:00").getDay()];
}