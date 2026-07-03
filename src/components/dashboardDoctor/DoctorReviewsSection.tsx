"use client";

// ============================================================
// DOCTOR REVIEWS SECTION — components/dashboardDoctor/DoctorReviewsSection.tsx
// ============================================================
//
// Section "Avis de mes patients" du tableau de bord médecin.
//   - Résumé : note moyenne + nombre d'avis + répartition par étoile
//   - Liste détaillée (réutilise ReviewsList)
//
// Les données viennent de la collection "reviews" filtrées par
// doctorId (écoutées en temps réel par la page parente).
// ============================================================

import { Review } from "@/types/review";
import { averageRating } from "@/lib/reviews";
import StarRating from "@/components/review/StarRating";
import ReviewsList from "@/components/review/ReviewsList";

type Props = {
  reviews: Review[];
  loading: boolean;
};

export default function DoctorReviewsSection({ reviews, loading }: Props) {
  const avg = averageRating(reviews);
  const total = reviews.length;

  // Répartition du nombre d'avis par note (5★ → 1★)
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(Number(r.rating) || 0) === star)
      .length,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Avis de mes patients</h2>

      {/* ── Résumé note moyenne + répartition ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {total === 0 ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-sm text-gray-500">
              Vous n&apos;avez pas encore reçu d&apos;avis.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Les avis apparaîtront ici après les consultations.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Note globale */}
            <div className="text-center flex-shrink-0">
              <p className="text-4xl font-bold text-gray-900">
                {avg.toFixed(1)}
              </p>
              <div className="mt-1 flex justify-center">
                <StarRating rating={avg} size={16} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {total} avis au total
              </p>
            </div>

            {/* Répartition par étoile */}
            <div className="flex-1 w-full space-y-1.5">
              {distribution.map(({ star, count }) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-6 flex-shrink-0">
                      {star}★
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-gray-400 w-6 text-right flex-shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Liste détaillée des avis ── */}
      <ReviewsList reviews={reviews} loading={loading} />
    </section>
  );
}
