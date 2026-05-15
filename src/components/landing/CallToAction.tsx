"use client";

// ============================================================
// CALL TO ACTION — components/landing/CallToAction.tsx
// Section finale avant le footer — pousse à l'inscription
// ============================================================

import { useRouter } from "next/navigation";

export default function CallToAction() {
  const router = useRouter();

  return (
    <section className="bg-gray-50 py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* ── Titre ── */}
        <h2 className="text-3xl md:text-5xl font-bold text-blue-900 leading-tight mb-5">
          Votre santé commence{" "}
          <span className="text-yellow-500 italic">maintenant</span>
        </h2>

        {/* ── Sous-titre ── */}
        <p className="text-gray-500 font-light text-lg leading-relaxed mb-10">
          Rejoignez des milliers de Guinéens qui prennent soin de leur santé
          grâce à Doctolib Guinée. Inscription gratuite, sans engagement.
        </p>

        {/* ── Boutons d'action ── */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => router.push("/register")}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Créer mon compte gratuitement
          </button>
          <button
            onClick={() => router.push("/search")}
            className="border border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Voir les médecins
          </button>
        </div>

        {/* ── Badges de confiance ── */}
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { icon: "🔒", label: "Données sécurisées" },
            { icon: "✅", label: "100% gratuit pour les patients" },
            { icon: "⚡", label: "Réservation en 2 min" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-gray-500 text-sm">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
