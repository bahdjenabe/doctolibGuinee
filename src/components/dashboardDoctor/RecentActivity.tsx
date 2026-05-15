"use client";

// ============================================================
// RECENT ACTIVITY — components/doctor-dashboard/RecentActivity.tsx
// Activité récente : derniers RDV confirmés ou annulés
// Affiche les 5 derniers événements
// ============================================================

type Appointment = {
  id: string;
  patientName: string;
  date: string;
  status: string;
  cancelledBy?: string;
  createdAt?: any;
};

type Props = {
  appointments: Appointment[]; // tous les appointments du médecin
};

// Formate la date en "20 avr. à 09:00"
const formatShort = (dateStr: string): string => {
  const local = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  const d = new Date(local);
  return (
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) +
    " à " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

export default function RecentActivity({ appointments }: Props) {
  // On prend les 5 derniers (par date de création ou date RDV)
  const recent = [...appointments]
    .sort((a, b) => {
      // Tri par date du RDV décroissante
      const da = new Date(
        a.date.endsWith("Z") ? a.date.slice(0, -1) : a.date,
      ).getTime();
      const db = new Date(
        b.date.endsWith("Z") ? b.date.slice(0, -1) : b.date,
      ).getTime();
      return db - da;
    })
    .slice(0, 5);

  return (
    <div>
      {/* En-tête */}
      <h2 className="font-bold text-gray-900 text-lg mb-4">Activité récente</h2>

      {/* Aucune activité */}
      {recent.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-gray-400 text-sm">Aucune activité récente</p>
        </div>
      )}

      {/* Timeline d'activité */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {recent.map((appt, i) => {
          const isCancelled = appt.status === "cancelled";

          return (
            <div key={appt.id} className="flex items-center gap-3 px-4 py-3.5">
              {/* Indicateur coloré */}
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isCancelled ? "bg-red-400" : "bg-green-400"
                }`}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {appt.patientName || "Patient inconnu"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatShort(appt.date)}
                </p>
              </div>

              {/* Statut */}
              <span
                className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isCancelled
                    ? "bg-red-50 text-red-500"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {isCancelled ? "Annulé" : "Confirmé"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
