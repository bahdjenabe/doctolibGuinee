"use client";

// ============================================================
// PAYMENT PAGE — src/app/payment/page.tsx
// ============================================================
//
// Page de paiement avant confirmation du rendez-vous.
//
// FLUX COMPLET :
//   /doctor/[id]?date=XXX
//     → clic "Confirmer"
//     → non connecté → /login?redirect=/payment?...
//     → connecté → /payment?doctorId=X&date=Y&doctorName=Z&specialty=W&city=V
//     → patient choisit la méthode de paiement
//     → remplit le formulaire
//     → clique "Payer"
//     → simulation 2s (spinners)
//     → succès → addDoc dans appointments (status: "confirmed", paid: true)
//     → écran succès → redirection /dashboard après 3s
//
// Composants utilisés :
//   - PaymentHeader   → header avec indicateur d'étapes
//   - PaymentSummary  → résumé RDV + montant
//   - PaymentMethods  → sélection Orange Money / Wave / Carte
//   - PaymentForm     → formulaire selon méthode choisie
//   - PaymentSuccess  → écran de succès après paiement
//
// Paramètres URL attendus :
//   ?doctorId=    ID Firestore du médecin
//   &date=        timestamp du créneau (ms)
//   &doctorName=  nom du médecin
//   &specialty=   spécialité
//   &city=        ville
//   &amount=      montant en GNF (optionnel, défaut: 150000)
// ============================================================

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Composants
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentMethods, {
  PaymentMethod,
} from "@/components/payment/PaymentMethods";
import PaymentForm, { PaymentData } from "@/components/payment/PaymentForm";
import PaymentSuccess from "@/components/payment/PaymentSuccess";

// ============================================================
// HELPER — génère une référence de paiement unique
// Ex: "PAY-2026-A3F9K2"
// ============================================================
const generatePaymentRef = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `PAY-${new Date().getFullYear()}-${random}`;
};

// ============================================================
// COMPOSANT INTERNE — contenu de la page paiement
// Séparé pour être enveloppé par ProtectedRoute
// ============================================================
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // ── Lecture des paramètres URL ──
  const doctorId = searchParams.get("doctorId") || "";
  const date = searchParams.get("date") || "";
  const doctorName = searchParams.get("doctorName") || "Médecin";
  const specialty = searchParams.get("specialty") || "";
  const city = searchParams.get("city") || "";
  const amount = Number(searchParams.get("amount")) || 150000; // 150 000 GNF par défaut

  // ── States ──
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  // ── Paramètres manquants → retour ──
  if (!doctorId || !date) {
    router.push("/search");
    return null;
  }

  // ── Simulation du paiement + confirmation RDV ──
  const handlePay = async (data: PaymentData) => {
    if (!user) return;

    setPaying(true);
    setError("");

    try {
      // ── Étape 1 : Simulation du paiement (2 secondes) ──
      // En production : remplacer par l'appel API Orange Money / Wave / Stripe
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ── Étape 2 : Vérification que le créneau est encore libre ──
      const slotDate = new Date(Number(date));
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateString = `${slotDate.getFullYear()}-${pad(slotDate.getMonth() + 1)}-${pad(slotDate.getDate())}T${pad(slotDate.getHours())}:${pad(slotDate.getMinutes())}:00.000`;

      const q = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctorId),
        where("date", "==", dateString),
        where("status", "==", "confirmed"),
      );
      const snap = await getDocs(q);

      // Créneau pris entre-temps → erreur
      if (!snap.empty) {
        setError(
          "❌ Ce créneau vient d'être pris. Veuillez choisir un autre créneau.",
        );
        setPaying(false);
        return;
      }

      // ── Étape 3 : Génération de la référence de paiement ──
      const ref = generatePaymentRef();
      setPaymentRef(ref);

      // ── Étape 4 : Écriture du RDV dans Firestore ──
      // On ajoute les champs de paiement : paid, paymentRef, paymentMethod
      await addDoc(collection(db, "appointments"), {
        doctorId: doctorId,
        doctorName: doctorName,
        specialty: specialty,
        city: city,
        date: dateString,

        // Infos patient
        patientId: user.uid,
        patientName: user.displayName || user.email || "Patient",

        // Statut RDV
        status: "confirmed",

        // ── Informations de paiement ──
        paid: true, // RDV payé
        paymentRef: ref, // référence unique
        paymentMethod: data.method, // orange_money | wave | card
        amount: amount, // montant en GNF
        paymentMode: "simulation", // à changer en "production" plus tard

        createdAt: serverTimestamp(),
      });

      // ── Étape 5 : Affiche l'écran de succès ──
      setSuccess(true);

      // Redirection vers /dashboard après 3.5s
      setTimeout(() => {
        router.push("/dashboard");
      }, 3500);
    } catch (err) {
      console.error("Erreur paiement:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
      setPaying(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header avec indicateur d'étapes */}
      <PaymentHeader step={success ? "success" : "payment"} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ── Écran de succès ── */}
        {success ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <PaymentSuccess
              doctorName={doctorName}
              specialty={specialty}
              date={date}
              amount={amount}
              paymentRef={paymentRef}
            />
          </div>
        ) : (
          /* ── Formulaire de paiement ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche — résumé */}
            <div className="space-y-4">
              <PaymentSummary
                doctorName={doctorName}
                specialty={specialty}
                city={city}
                date={date}
                amount={amount}
              />
            </div>

            {/* Colonne droite — méthode + formulaire */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              {/* Sélection de la méthode */}
              <PaymentMethods
                selected={selectedMethod}
                onSelect={setSelectedMethod}
              />

              {/* Formulaire selon la méthode choisie */}
              {selectedMethod && (
                <>
                  <div className="border-t border-gray-100" />
                  <PaymentForm
                    method={selectedMethod}
                    amount={amount}
                    onPay={handlePay}
                    paying={paying}
                  />
                </>
              )}

              {/* Message si aucune méthode sélectionnée */}
              {!selectedMethod && (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">
                    👆 Choisissez un moyen de paiement pour continuer
                  </p>
                </div>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// EXPORT — enveloppé dans ProtectedRoute
// Si non connecté → redirige vers /login
// ============================================================
export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentContent />
    </ProtectedRoute>
  );
}
