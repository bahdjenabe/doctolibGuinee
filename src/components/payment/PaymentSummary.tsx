"use client";

// ============================================================
// PAYMENT SUMMARY — components/payment/PaymentSummary.tsx
// Résumé du rendez-vous et montant à payer
// Affiché à gauche / en haut selon l'écran
// ============================================================

type Props = {
  doctorName: string;
  specialty: string;
  city: string;
  date: string; // timestamp string
  amount: number; // montant en GNF
};

// Formate une date timestamp en texte lisible
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

// Formate un montant en Francs Guinéens
const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("fr-FR").format(amount) + " GNF";

export default function PaymentSummary({
  doctorName,
  specialty,
  city,
  date,
  amount,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Titre */}
      <h2 className="font-bold text-gray-900 text-base mb-4">
        Résumé du rendez-vous
      </h2>

      {/* Infos du RDV */}
      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-3">
          <span className="text-lg">🩺</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{doctorName}</p>
            <p className="text-blue-600 text-xs">{specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg">📍</span>
          <p className="text-gray-600 text-sm">{city}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg">📅</span>
          <p className="text-gray-600 text-sm">{formatDate(date)}</p>
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-gray-100 pt-4">
        {/* Détail du tarif */}
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Consultation</span>
          <span>{formatAmount(amount)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>Frais de service</span>
          <span>Gratuit</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3">
          <span className="font-bold text-gray-900">Total à payer</span>
          <span className="font-bold text-blue-700 text-lg">
            {formatAmount(amount)}
          </span>
        </div>
      </div>

      {/* Badge sécurité */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Paiement 100% sécurisé · Remboursé si annulé par le médecin</span>
      </div>
    </div>
  );
}
