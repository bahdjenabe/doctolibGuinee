"use client";

// ============================================================
// PAYMENT HEADER — components/payment/PaymentHeader.tsx
// Header simple de la page de paiement
// Avec indicateur d'étapes : Créneau → Paiement → Confirmé
// ============================================================

import { useRouter } from "next/navigation";

type Props = {
  step: "payment" | "success"; // étape actuelle
};

// Les 3 étapes du processus de réservation
const STEPS = [
  { label: "Créneau", key: "slot" },
  { label: "Paiement", key: "payment" },
  { label: "Confirmé", key: "success" },
];

export default function PaymentHeader({ step }: Props) {
  const router = useRouter();

  // Index de l'étape actuelle
  const currentIndex = step === "payment" ? 1 : 2;

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-6 py-4">
        {/* Ligne logo + bouton retour */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v16M4 12h16"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-bold text-blue-900 text-sm">
              Doctolib Guinée
            </span>
          </div>

          {/* Bouton retour — seulement sur l'étape paiement */}
          {step === "payment" && (
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Retour
            </button>
          )}
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div key={s.key} className="flex items-center flex-1">
                {/* Cercle étape */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isDone
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                          ? "bg-blue-700 border-blue-700 text-white"
                          : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {isDone ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      isCurrent
                        ? "text-blue-700"
                        : isDone
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Ligne de connexion entre étapes */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-4 mx-1 ${
                      isDone ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
