"use client";

// ============================================================
// STAR RATING — components/review/StarRating.tsx
// Affichage en lecture seule d'une note sous forme d'étoiles.
// ============================================================

type Props = {
  rating: number; // note (peut être décimale, arrondie à l'entier)
  size?: number; // taille en px
  showValue?: boolean; // afficher la valeur numérique à côté
};

export default function StarRating({
  rating,
  size = 14,
  showValue = false,
}: Props) {
  const filled = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ fontSize: size, lineHeight: 1 }}
          className={i <= filled ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
      {showValue && (
        <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
