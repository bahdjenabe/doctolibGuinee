"use client";

// ============================================================
// REVIEWS LIST — components/review/ReviewsList.tsx
// Section "Avis des patients" sur la fiche médecin.
// ============================================================

import { Review } from "@/types/review";
import StarRating from "./StarRating";

type Props = {
  reviews: Review[];
  loading: boolean;
};

// Date courte : "9 juin 2026"
const formatDate = (createdAt: any): string => {
  try {
    const d =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : new Date(createdAt);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Initiales pour l'avatar
const initials = (name: string): string =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase() || "P";

export default function ReviewsList({ reviews, loading }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-4">
        Avis des patients{" "}
        {reviews.length > 0 && (
          <span className="text-gray-400 font-normal">({reviews.length})</span>
        )}
      </h2>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm text-gray-500">Aucun avis pour le moment</p>
          <p className="text-xs text-gray-400 mt-1">
            Soyez le premier à partager votre expérience
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="border-b border-gray-50 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-start gap-3">
                {/* Avatar initiales */}
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(r.patientName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.patientName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1">
                    <StarRating rating={r.rating} size={13} />
                  </div>

                  {r.comment && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
