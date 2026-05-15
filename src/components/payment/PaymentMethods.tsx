"use client";

// ============================================================
// PAYMENT METHODS — components/payment/PaymentMethods.tsx
// Sélection du moyen de paiement
// Orange Money / Wave / Carte bancaire (simulation)
// ============================================================

export type PaymentMethod = "orange_money" | "wave" | "card";

type Method = {
  id: PaymentMethod;
  label: string;
  sub: string;
  emoji: string;
  color: string;
  border: string;
  active: string;
};

// Les méthodes de paiement disponibles
const METHODS: Method[] = [
  {
    id: "orange_money",
    label: "Orange Money",
    sub: "Paiement via votre compte Orange",
    emoji: "🟠",
    color: "hover:bg-orange-50",
    border: "border-gray-200",
    active: "border-orange-500 bg-orange-50",
  },
  {
    id: "wave",
    label: "Wave",
    sub: "Paiement via l'application Wave",
    emoji: "🌊",
    color: "hover:bg-blue-50",
    border: "border-gray-200",
    active: "border-blue-500 bg-blue-50",
  },
  {
    id: "card",
    label: "Carte bancaire",
    sub: "Visa, Mastercard, carte internationale",
    emoji: "💳",
    color: "hover:bg-purple-50",
    border: "border-gray-200",
    active: "border-purple-500 bg-purple-50",
  },
];

type Props = {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
};

export default function PaymentMethods({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bold text-gray-900 text-base mb-4">
        Choisir un moyen de paiement
      </h2>

      <div className="space-y-3">
        {METHODS.map((method) => {
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? method.active
                  : `bg-white ${method.border} ${method.color}`
              }`}
            >
              {/* Emoji méthode */}
              <span className="text-2xl flex-shrink-0">{method.emoji}</span>

              {/* Infos */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {method.label}
                </p>
                <p className="text-gray-400 text-xs font-light mt-0.5">
                  {method.sub}
                </p>
              </div>

              {/* Radio button */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  isSelected ? "border-blue-700" : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-700" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
