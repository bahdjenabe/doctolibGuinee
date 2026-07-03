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

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { listenAllBookedSlots, BookedSlot } from "@/lib/bookedSlots";

import { Doctor } from "@/types/doctor";
import { cleanWorkingHours, countAvailable } from "@/lib/slots";

import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import DoctorList from "@/components/search/DoctorList";
import SlotSidebar from "@/components/search/SlotSidebar";

function SearchContent() {
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
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Filtres
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

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
  // FILTRES — texte + spécialité + ville + disponibilité du jour
  // Réagit aussi aux appointments (temps réel) pour la dispo du jour.
  // ──────────────────────────────────────────
  useEffect(() => {
    const term = searchInput.toLowerCase();
    const todayStr = new Date().toISOString().split("T")[0];

    // Disponibilité du jour pour un médecin donné
    const isAvailableToday = (d: Doctor): boolean => {
      const booked = new Set<number>(
        bookedSlots.filter((s) => s.doctorId === d.id).map((s) => s.time),
      );
      return countAvailable(todayStr, d.workingHours || {}, booked) > 0;
    };

    const results = doctors.filter((d) => {
      const matchesText =
        !term ||
        d.name.toLowerCase().includes(term) ||
        d.specialty.toLowerCase().includes(term);
      const matchesSpecialty = !specialtyFilter || d.specialty === specialtyFilter;
      const matchesCity = !cityFilter || d.city === cityFilter;
      const matchesAvailability = !onlyAvailableToday || isAvailableToday(d);

      return matchesText && matchesSpecialty && matchesCity && matchesAvailability;
    });

    setFilteredDoctors(results);
  }, [
    searchInput,
    doctors,
    specialtyFilter,
    cityFilter,
    onlyAvailableToday,
    bookedSlots,
  ]);

  // ──────────────────────────────────────────
  // Listes uniques pour les menus déroulants de filtres
  // ──────────────────────────────────────────
  const specialties = Array.from(
    new Set(doctors.map((d) => d.specialty).filter(Boolean)),
  ).sort();

  const cities = Array.from(
    new Set(doctors.map((d) => d.city).filter(Boolean)),
  ).sort();

  // Réinitialise tous les filtres
  const resetFilters = () => {
    setSpecialtyFilter("");
    setCityFilter("");
    setOnlyAvailableToday(false);
  };

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

  // ÉCOUTE TEMPS RÉEL DES CRÉNEAUX PRIS (collection publique bookedSlots)
  // Quand un RDV est annulé → le doc est supprimé → créneau libre
  // ──────────────────────────────────────────
  useEffect(() => {
    const unsub = listenAllBookedSlots(setBookedSlots);
    return () => unsub();
  }, []);

  // ──────────────────────────────────────────
  // bookedSet
  // Construit le Set des créneaux réservés pour le médecin sélectionné.
  // ──────────────────────────────────────────
  const bookedSet = new Set<number>(
    bookedSlots
      .filter((s) => s.doctorId === selectedDoctor?.id)
      .map((s) => s.time),
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

      {/* ── Barre de filtres ── */}
      <SearchFilters
        specialties={specialties}
        cities={cities}
        specialty={specialtyFilter}
        city={cityFilter}
        onlyAvailableToday={onlyAvailableToday}
        onSpecialtyChange={setSpecialtyFilter}
        onCityChange={setCityFilter}
        onAvailableTodayChange={setOnlyAvailableToday}
        onReset={resetFilters}
      />

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

// ============================================================
// EXPORT — Suspense requis par Next.js car useSearchParams()
// est utilisé dans un composant client prérendu statiquement
// ============================================================
export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
