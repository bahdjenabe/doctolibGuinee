"use client";

// ============================================================
// PAYMENT FORM — components/payment/PaymentForm.tsx
// Formulaire adapté selon la méthode de paiement choisie
//
// Orange Money → numéro de téléphone
// Wave         → numéro de téléphone
// Carte        → numéro carte + expiry + CVV (simulation)
//
// En mode simulation : n'importe quelle valeur valide fonctionne
// ============================================================

import { useState } from "react";
import { PaymentMethod } from "./PaymentMethods";

type Props = {
  method: PaymentMethod;
  amount: number;
  onPay: (data: PaymentData) => void; // callback quand le patient clique Payer
  paying: boolean; // true pendant la simulation
};

export type PaymentData = {
  method: PaymentMethod;
  phone?: string; // pour Orange Money / Wave
  card?: string; // numéro de carte
  expiry?: string; // date expiration
  cvv?: string; // code de sécurité
};

// Formate le numéro de carte avec espaces : "1234 5678 9012 3456"
const formatCard = (val: string): string =>
  val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

// Formate la date d'expiration : "12/26"
const formatExpiry = (val: string): string => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

export default function PaymentForm({ method, amount, onPay, paying }: Props) {
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Formate le montant en GNF
  const formatAmount = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(n) + " GNF";

  // Valide les champs selon la méthode
  const isValid = () => {
    if (method === "orange_money" || method === "wave") {
      return phone.replace(/\D/g, "").length >= 8;
    }
    if (method === "card") {
      return (
        card.replace(/\s/g, "").length === 16 &&
        expiry.length === 5 &&
        cvv.length >= 3
      );
    }
    return false;
  };

  const handlePay = () => {
    if (!isValid()) return;
    onPay({
      method,
      phone: method !== "card" ? phone : undefined,
      card: method === "card" ? card : undefined,
      expiry: method === "card" ? expiry : undefined,
      cvv: method === "card" ? cvv : undefined,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Formulaire Orange Money ou Wave ── */}
      {(method === "orange_money" || method === "wave") && (
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-4">
            {method === "orange_money" ? "🟠 Orange Money" : "🌊 Wave"}
          </h3>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              {/* Indicatif Guinée */}
              <span className="text-gray-500 text-sm font-medium flex-shrink-0">
                🇬🇳 +224
              </span>
              <div className="w-px h-5 bg-gray-200" />
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                placeholder="6XX XX XX XX"
                className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 font-light">
              Un code de confirmation sera envoyé à ce numéro
            </p>
          </div>

          {/* Instruction simulation */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mt-4">
            <p className="font-semibold mb-0.5">Mode simulation</p>
            <p className="font-light">
              Entrez n'importe quel numéro valide. Aucun vrai paiement ne sera
              effectué.
            </p>
          </div>
        </div>
      )}

      {/* ── Formulaire Carte bancaire ── */}
      {method === "card" && (
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-4">
            💳 Carte bancaire
          </h3>

          {/* Numéro de carte */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de carte
            </label>
            <input
              type="text"
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 tracking-widest"
            />
          </div>

          {/* Expiry + CVV sur la même ligne */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'expiration
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="123"
                maxLength={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Instruction simulation */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mt-4">
            <p className="font-semibold mb-0.5">Mode simulation</p>
            <p className="font-light">
              Utilisez le numéro test : 4242 4242 4242 4242 · Exp: 12/26 · CVV:
              123
            </p>
          </div>
        </div>
      )}

      {/* ── Bouton Payer ── */}
      <button
        disabled={!isValid() || paying}
        onClick={handlePay}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
          isValid() && !paying
            ? "bg-blue-700 hover:bg-blue-800 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {paying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement en cours...
          </span>
        ) : (
          `Payer ${formatAmount(amount)}`
        )}
      </button>

      {/* Mention sécurité */}
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Paiement sécurisé · Données chiffrées
      </p>
    </div>
  );
}
