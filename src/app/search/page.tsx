"use client";

// ============================================================
// SEARCH PAGE — src/app/search/page.tsx
// ============================================================
//
// Page de recherche de médecins.
// Gère la logique Firestore et passe les données aux composants.
//
// Composants utilisés :
//   - SearchBar   → barre de recherche sticky en haut
//   - DoctorList  → liste des médecins à gauche
//   - SlotSidebar → sidebar créneaux à droite
//
// Logique Firestore :
//   - onSnapshot("doctors")     → médecins en temps réel
//   - onSnapshot("appointments") → créneaux pris en temps réel
// ============================================================

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Doctor } from "@/types/doctor";
import { cleanWorkingHours, normalizeTime } from "@/lib/slots";

import SearchBar from "@/components/search/SearchBar";
import DoctorList from "@/components/search/DoctorList";
import SlotSidebar from "@/components/search/SlotSidebar";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Terme de recherche depuis l'URL (?query=...)
  const urlQuery = searchParams.get("query")?.toLowerCase() || "";

  // ──────────────────────────────────────────
  // STATES
  // ──────────────────────────────────────────

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // ──────────────────────────────────────────
  // ÉCOUTE TEMPS RÉEL DES DOCTORS
  // onSnapshot → se met à jour si workingHours change
  // ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "doctors"), (snap) => {
      const data: Doctor[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          name: raw.name || "",
          specialty: raw.specialty || "",
          city: raw.city || "",
          image: raw.image || "",
          rating: Number(raw.rating) || 4.5,
          reviews: raw.reviews || 50,
          workingHours: cleanWorkingHours(raw.workingHours),
        };
      });
      setDoctors(data);
      // Garde le médecin sélectionné à jour si ses données changent
      setSelectedDoctor((prev) =>
        prev ? data.find((d) => d.id === prev.id) || null : null,
      );
    });
    return () => unsub();
  }, []);

  // ──────────────────────────────────────────
  // FILTRES — réagit au champ de recherche
  // ──────────────────────────────────────────
  useEffect(() => {
    const results = searchInput
      ? doctors.filter(
          (d) =>
            d.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            d.specialty.toLowerCase().includes(searchInput.toLowerCase()),
        )
      : doctors;

    setFilteredDoctors(results);
  }, [searchInput, doctors]);

  // ──────────────────────────────────────────

  // useEffect(() => {
  //   // Aucun médecin trouvé
  //   if (filteredDoctors.length === 0) {
  //     setSelectedDoctor(null);
  //     setSelectedDate(null);
  //     setSelectedSlot(null);

  //     return;
  //   }

  //   // Premier médecin trouvé
  //   const firstDoctor = filteredDoctors[0];

  //   // Sélection automatique du médecin
  //   setSelectedDoctor(firstDoctor);

  //   // Date du jour
  //   const today = new Date();

  //   const todayStr = today.toISOString().split("T")[0];

  //   // Sélection automatique de la date
  //   setSelectedDate(todayStr);

  //   // Reset créneau
  //   setSelectedSlot(null);
  // }, [filteredDoctors]);

  useEffect(() => {
    // Aucun résultat
    if (filteredDoctors.length === 0) {
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedSlot(null);

      return;
    }

    // Si un médecin est déjà sélectionné
    // ET qu'il existe toujours dans les résultats
    // on ne change rien
    if (
      selectedDoctor &&
      filteredDoctors.some((d) => d.id === selectedDoctor.id)
    ) {
      return;
    }

    // Sélection automatique du premier médecin
    const firstDoctor = filteredDoctors[0];

    setSelectedDoctor(firstDoctor);

    // Date du jour
    const today = new Date();

    const todayStr = today.toISOString().split("T")[0];

    setSelectedDate(todayStr);

    setSelectedSlot(null);
  }, [filteredDoctors, selectedDoctor]);

  // ÉCOUTE TEMPS RÉEL DES APPOINTMENTS
  // Quand un RDV est annulé → le créneau redevient libre
  // ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ──────────────────────────────────────────
  // bookedSet
  // Construit le Set des créneaux réservés pour le médecin sélectionné.
  // status !== "cancelled" → les annulés libèrent le créneau.
  // ──────────────────────────────────────────
  const bookedSet = new Set<number>(
    appointments
      .filter(
        (a) => a.doctorId === selectedDoctor?.id && a.status !== "cancelled",
      )
      .map((a) => normalizeTime(a.date))
      .filter((t): t is number => t !== null),
  );

  // ──────────────────────────────────────────
  // Sélection d'un médecin depuis la liste
  // Reset la date et le créneau sélectionnés
  // ──────────────────────────────────────────
  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // setSelectedDate(null);
    const today = new Date();

    setSelectedDate(today.toISOString().split("T")[0]);
    setSelectedSlot(null);
  };

  // ──────────────────────────────────────────
  // Sélection d'une date dans DayStrip
  // Reset le créneau sélectionné
  // ──────────────────────────────────────────
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Barre de recherche sticky ── */}
      <SearchBar value={searchInput} onChange={setSearchInput} />

      {/* ── Corps de la page ── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* ── Liste des médecins (3/4 de la largeur) ── */}
        <DoctorList
          doctors={filteredDoctors}
          selectedDoctor={selectedDoctor}
          onSelect={handleSelectDoctor}
        />

        {/* ── Sidebar créneaux (1/4 de la largeur) ── */}
        <SlotSidebar
          doctor={selectedDoctor}
          bookedSet={bookedSet}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onSelectDate={handleSelectDate}
          onSelectSlot={setSelectedSlot}
        />
      </div>
    </main>
  );
}
