"use client";

// ============================================================
// PAYMENT BADGE — components/payment/PaymentBadge.tsx
// Badge réutilisable qui affiche le statut de paiement
// Utilisé dans les cartes RDV patient ET médecin
// ============================================================

type Props = {
  paid: boolean; // true si paiement effectué
  amount?: number; // montant en GNF
  paymentMethod?: string; // "orange_money" | "wave" | "card"
  paymentRef?: string; // référence de paiement
  compact?: boolean; // mode compact (juste le badge)
};

// Emoji et label selon la méthode de paiement
const getMethodLabel = (method?: string): string => {
  switch (method) {
    case "orange_money":
      return "🟠 Orange Money";
    case "wave":
      return "🌊 Wave";
    case "card":
      return "💳 Carte bancaire";
    default:
      return "💰 Paiement";
  }
};

// Formate un montant en GNF
const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("fr-FR").format(amount) + " GNF";

export default function PaymentBadge({
  paid,
  amount,
  paymentMethod,
  paymentRef,
  compact = false,
}: Props) {
  // ── Mode compact : juste un petit badge coloré ──
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
          paid ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"
        }`}
      >
        {paid ? "✓ Payé" : "✗ Non payé"}
      </span>
    );
  }

  // ── Mode complet : carte avec tous les détails ──
  return (
    <div
      className={`rounded-xl px-4 py-3 border text-sm ${
        paid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}
    >
      {/* Ligne principale : statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{paid ? "✅" : "❌"}</span>
          <span
            className={`font-semibold ${paid ? "text-green-700" : "text-red-600"}`}
          >
            {paid ? "Paiement effectué" : "Non payé"}
          </span>
        </div>

        {/* Montant */}
        {paid && amount && (
          <span className="font-bold text-green-700">
            {formatAmount(amount)}
          </span>
        )}
      </div>

      {/* Détails du paiement */}
      {paid && (paymentMethod || paymentRef) && (
        <div className="mt-2 space-y-1 text-xs text-green-600 font-light">
          {paymentMethod && <p>{getMethodLabel(paymentMethod)}</p>}
          {paymentRef && (
            <p>
              Réf :{" "}
              <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-green-800">
                {paymentRef}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
