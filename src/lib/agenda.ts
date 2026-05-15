// ============================================================
// HELPERS — src/lib/agenda.ts
// Fonctions utilitaires partagées pour l'agenda médecin
// ============================================================

// Parse une date string Firestore en objet Date
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0);
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(local);
};

// Formate une date en français : "lundi 20 avril 2026 à 09:00"
export const formatDate = (dateStr: string): string => {
  const d = parseDate(dateStr);
  return (
    d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day:     "numeric",
      month:   "long",
      year:    "numeric",
    }) +
    " à " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

// Retourne true si le RDV est dans le futur
export const isUpcoming = (dateStr: string): boolean =>
  parseDate(dateStr).getTime() > Date.now();

// Retourne true si le RDV est aujourd'hui
export const isToday = (dateStr: string): boolean => {
  const d   = parseDate(dateStr); 
  const now = new Date();
  return (
    d.getDate()     === now.getDate()   &&
    d.getMonth()    === now.getMonth()  &&
    d.getFullYear() === now.getFullYear()
  );
};