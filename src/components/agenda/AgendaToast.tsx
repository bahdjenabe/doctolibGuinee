"use client";

// ============================================================
// AGENDA TOAST — components/agenda/AgendaToast.tsx
// Notification toast affichée en haut de l'écran
// Apparaît après une annulation réussie
// ============================================================

type Props = {
  message: string; // message à afficher
  visible: boolean; // true = affiché, false = caché
};

export default function AgendaToast({ message, visible }: Props) {
  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 bg-green-600 text-white
        px-5 py-3.5 rounded-2xl shadow-xl min-w-[280px]
        transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0" // visible → glisse vers le bas
            : "opacity-0 -translate-y-3 pointer-events-none" // caché → glisse vers le haut
        }`}
    >
      {/* Icône coche */}
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-semibold">{message}</p>
        <p className="text-white/70 text-xs mt-0.5">
          Patient notifié · Créneau libéré
        </p>
      </div>
    </div>
  );
}
