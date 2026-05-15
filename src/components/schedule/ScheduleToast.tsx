"use client";

// ============================================================
// SCHEDULE TOAST — components/schedule/ScheduleToast.tsx
// Notification toast affichée en haut après sauvegarde
// Vert = succès / Rouge = erreur
// ============================================================

type Props = {
  message: string;
  type: "success" | "error";
  visible: boolean;
};

export default function ScheduleToast({ message, type, visible }: Props) {
  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl
        min-w-[280px] max-w-sm transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 pointer-events-none"
        } ${
          type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-500 text-white"
        }`}
    >
      {/* Icône selon le type */}
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        {type === "success" ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>

      {/* Message + sous-texte */}
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug">{message}</p>
        {type === "success" && (
          <p className="text-white/70 text-xs mt-0.5">
            Redirection vers la recherche...
          </p>
        )}
      </div>
    </div>
  );
}
