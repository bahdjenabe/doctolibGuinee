"use client";

// ============================================================
// REVIEW MODAL — components/dashboard/ReviewModal.tsx
// Le patient laisse une note (1-5 ★) + un commentaire sur un
// rendez-vous passé.
// ============================================================

import { useState } from "react";
import { Appointment } from "@/types/appointment";

type Props = {
  appointment: Appointment; // RDV concerné
  submitting: boolean; // true pendant l'écriture Firestore
  error: string;
  onConfirm: (rating: number, comment: string) => void;
  onClose: () => void;
};

const LABELS = ["", "Très déçu", "Décevant", "Correct", "Bien", "Excellent"];

export default function ReviewModal({
  appointment,
  submitting,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const display = hover || rating;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* En-tête */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Évaluer votre rendez-vous
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {appointment.doctorName} · {appointment.specialty}
            </p>
          </div>

          {/* Sélecteur d'étoiles */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    i <= display ? "text-yellow-400" : "text-gray-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600 h-5">
              {LABELS[display] || "Sélectionnez une note"}
            </p>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre commentaire{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Partagez votre expérience avec ce praticien..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              disabled={submitting}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              disabled={rating === 0 || submitting}
              onClick={() => onConfirm(rating, comment)}
              className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                rating > 0 && !submitting
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi...
                </span>
              ) : (
                "Publier mon avis"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
