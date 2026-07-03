"use client";

// ============================================================
// PASSWORD STRENGTH — components/register/PasswordStrength.tsx
// Indicateur visuel de la force du mot de passe
// 4 niveaux : Faible / Correct / Bon / Excellent
// ============================================================

type Props = {
  password: string;
};

// Calcule le score de 0 à 4
const getScore = (password: string): number => {
  let score = 0;
  if (password.length >= 6) score++; // longueur minimale
  if (password.length >= 10) score++; // longueur confortable
  if (/[A-Z]/.test(password)) score++; // majuscule
  if (/[0-9!@#$%]/.test(password)) score++; // chiffre ou symbole
  return score;
};

const LEVELS = [
  { label: "Faible", color: "bg-red-500" },
  { label: "Correct", color: "bg-orange-400" },
  { label: "Bon", color: "bg-blue-500" },
  { label: "Excellent", color: "bg-green-500" },
];

const TEXT_COLORS = [
  "text-red-500",
  "text-orange-400",
  "text-blue-500",
  "text-green-500",
];

export default function PasswordStrength({ password }: Props) {
  if (!password) return null;

  const score = Math.max(0, getScore(password) - 1); // index 0-3
  const level = LEVELS[score];

  return (
    <div className="mt-2">
      {/* Barres de progression */}
      <div className="flex gap-1 mb-1">
        {LEVELS.map((l, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? level.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className={`text-xs font-medium ${TEXT_COLORS[score]}`}>
        {level.label}
      </p>
    </div>
  );
}
