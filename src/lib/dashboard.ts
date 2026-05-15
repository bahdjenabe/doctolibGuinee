// ============================================================
// HELPERS — src/lib/dashboard.ts
// Fonctions utilitaires partagées entre les composants dashboard
// ============================================================

// Parse une date string Firestore en objet Date
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0);
  // Retire le "Z" pour lire en heure locale (évite le décalage UTC)
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(local);
};

// Formate une date en français lisible : "lundi 20 avril 2026 à 09:00"
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

// Retourne un emoji selon la spécialité médicale
export const getSpecialtyEmoji = (specialty: string): string => {
  const map: Record<string, string> = {
    cardiologue:         "❤️",
    généraliste:         "🩺",
    "médecin généraliste": "🩺",
    dentiste:            "🦷",
    gynécologue:         "🌸",
    pédiatre:            "👶",
    ophtalmologue:       "👁️",
    dermatologue:        "🧴",
    neurologue:          "🧠",
    psychiatre:          "💭",
    radiologue:          "🩻",
    pharmacien:          "💊",
  };
  const key = specialty?.toLowerCase() || "";
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return "🏥";
};