"use client";

// ============================================================
// SEARCH FILTERS — components/search/SearchFilters.tsx
// Barre de filtres sous la SearchBar :
//   - Spécialité (liste déroulante, dérivée des médecins)
//   - Ville (liste déroulante, dérivée des médecins)
//   - Disponible aujourd'hui (toggle)
//   - Réinitialiser (si au moins un filtre actif)
// ============================================================

type Props = {
  specialties: string[]; // spécialités disponibles
  cities: string[]; // villes disponibles
  specialty: string; // filtre spécialité actif ("" = toutes)
  city: string; // filtre ville actif ("" = toutes)
  onlyAvailableToday: boolean; // toggle disponibilité du jour
  onSpecialtyChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onAvailableTodayChange: (v: boolean) => void;
  onReset: () => void;
};

export default function SearchFilters({
  specialties,
  cities,
  specialty,
  city,
  onlyAvailableToday,
  onSpecialtyChange,
  onCityChange,
  onAvailableTodayChange,
  onReset,
}: Props) {
  const hasActiveFilter = !!specialty || !!city || onlyAvailableToday;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* ── Spécialité ── */}
        <div className="relative">
          <select
            value={specialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className={`appearance-none cursor-pointer rounded-xl border px-4 py-2.5 pr-9 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              specialty
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <option value="">Toutes les spécialités</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            ▾
          </span>
        </div>

        {/* ── Ville ── */}
        <div className="relative">
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className={`appearance-none cursor-pointer rounded-xl border px-4 py-2.5 pr-9 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              city
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            ▾
          </span>
        </div>

        {/* ── Disponible aujourd'hui ── */}
        <button
          type="button"
          onClick={() => onAvailableTodayChange(!onlyAvailableToday)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            onlyAvailableToday
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          {onlyAvailableToday ? "✓ " : ""}Disponible aujourd&apos;hui
        </button>

        {/* ── Réinitialiser ── */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
