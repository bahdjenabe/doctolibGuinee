"use client";

// ============================================================
// CUSTOM RANGE INPUT — components/schedule/CustomRangeInput.tsx
// Champ de saisie manuelle d'une plage horaire personnalisée
// Format attendu : HH:MM-HH:MM (ex: 09:30-11:30)
// Validation avant ajout
// ============================================================

import { useState } from "react";

type Props = {
  onAdd: (range: string) => void; // callback quand la plage est validée
};

export default function CustomRangeInput({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // Valide et ajoute la plage saisie
  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Validation du format HH:MM-HH:MM
    const regex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
    if (!regex.test(trimmed)) {
      setError("Format invalide. Utilisez HH:MM-HH:MM (ex: 09:00-12:00)");
      return;
    }

    setError("");
    onAdd(trimmed);
    setValue(""); // vide le champ après ajout
  };

  return (
    <div>
      {/* Champ + bouton sur la même ligne */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="ex: 09:00-13:00"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {/* Message d'erreur de format */}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
