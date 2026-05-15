"use client";

// ============================================================
// STATS — components/landing/Stats.tsx
// Chiffres clés de la plateforme
// ============================================================

// Liste des statistiques à afficher
const STATS = [
  {
    value: "500+",
    label: "Médecins",
    sub: "inscrits sur la plateforme",
    color: "text-blue-700",
  },
  {
    value: "10k+",
    label: "Patients",
    sub: "nous font confiance",
    color: "text-yellow-500",
  },
  {
    value: "98%",
    label: "Satisfaction",
    sub: "des utilisateurs",
    color: "text-green-600",
  },
  {
    value: "24/7",
    label: "Disponible",
    sub: "toujours accessible",
    color: "text-purple-600",
  },
];

export default function Stats() {
  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Valeur principale */}
            <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
              {stat.value}
            </div>
            {/* Label */}
            <div className="text-gray-900 font-semibold text-sm">
              {stat.label}
            </div>
            {/* Sous-label */}
            <div className="text-gray-400 text-xs mt-1 font-light">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
