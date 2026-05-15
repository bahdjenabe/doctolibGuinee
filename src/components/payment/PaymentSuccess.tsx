"use client";

// ============================================================
// PAYMENT SUCCESS — components/payment/PaymentSuccess.tsx
// Écran affiché après un paiement réussi et RDV confirmé
// Animation de coche verte + récapitulatif + redirection
// ============================================================

type Props = {
  doctorName: string;
  specialty: string;
  date: string; // timestamp string
  amount: number; // montant payé en GNF
  paymentRef: string; // référence de paiement générée
};

// Formate un timestamp en date lisible
const formatDate = (dateStr: string): string => {
  const ts = Number(dateStr);
  const d = new Date(ts);
  return (
    d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " à " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

// Formate un montant en GNF
const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("fr-FR").format(amount) + " GNF";

export default function PaymentSuccess({
  doctorName,
  specialty,
  date,
  amount,
  paymentRef,
}: Props) {
  return (
    <div className="text-center py-6">
      {/* ── Animation icône succès ── */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* ── Titre ── */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Paiement réussi ! 🎉
      </h2>
      <p className="text-gray-500 font-light text-sm mb-8">
        Votre rendez-vous est confirmé et sécurisé.
      </p>

      {/* ── Récapitulatif du RDV ── */}
      <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
        {/* Médecin */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {doctorName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{doctorName}</p>
            <p className="text-blue-600 text-xs">{specialty}</p>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Date */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-lg">📅</span>
          <span className="text-gray-700">{formatDate(date)}</span>
        </div>

        {/* Montant payé */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-lg">💰</span>
          <span className="text-gray-700">
            Montant payé :{" "}
            <strong className="text-green-600">{formatAmount(amount)}</strong>
          </span>
        </div>

        {/* Référence de paiement */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-lg">🧾</span>
          <div>
            <span className="text-gray-700">Référence : </span>
            <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-800">
              {paymentRef}
            </span>
          </div>
        </div>
      </div>

      {/* ── Badge simulation ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 mb-6">
        ⚠️ Mode simulation — Aucun vrai paiement n'a été effectué
      </div>

      {/* ── Message redirection ── */}
      <p className="text-gray-400 text-xs">
        Redirection vers votre tableau de bord...
      </p>
    </div>
  );
}
