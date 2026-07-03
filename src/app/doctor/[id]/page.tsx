"use client";

// ============================================================
// FICHE MÉDECIN PUBLIQUE — /doctor/[id]/page.tsx
// ============================================================
//
// Profil public d'un médecin (accessible sans connexion) :
//   - En-tête : photo, nom, spécialité, note, ville, badge vérifié
//   - À propos / présentation
//   - Informations pratiques (adresse, langues, expérience)
//   - Horaires de consultation (hebdomadaires)
//   - Widget de réservation : choix jour (DayStrip) + créneau (SlotGrid)
//
// Réservation :
//   choix créneau → "Confirmer"
//     → non connecté → /login?redirect=/payment?...  (créneau préservé)
//     → connecté     → /payment?...
//
// ?date=<ms> en query → pré-sélectionne un créneau (venant de /search).
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { listenDoctorBookedSlots } from "@/lib/bookedSlots";
import { generateSlots, getDayName, cleanWorkingHours } from "@/lib/slots";
import { DAYS } from "@/types/schedule";
import { Review } from "@/types/review";
import { averageRating } from "@/lib/reviews";

import { getOrCreateConversation } from "@/lib/messaging";
import DayStrip from "@/components/search/Daystrip";
import SlotGrid from "@/components/search/SlotGrid";
import SelectedSlot from "@/components/confirmation/SelectedSlot";
import StarRating from "@/components/review/StarRating";
import ReviewsList from "@/components/review/ReviewsList";

// ============================================================
// TYPE — profil enrichi (champs optionnels lus défensivement)
// ============================================================

type DoctorProfile = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  image?: string;
  rating?: number;
  reviews?: number;
  workingHours?: { [key: string]: string[] };
  // Champs optionnels de la fiche
  bio?: string;
  address?: string;
  phone?: string;
  languages?: string[];
  experience?: number; // années d'expérience
};

// ============================================================
// COMPONENT
// ============================================================

export default function DoctorPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const dateParam = searchParams.get("date");
  const slotFromSearch = dateParam ? Number(dateParam) : null;

  // ================== STATE ==================
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedTimes, setBookedTimes] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(
    slotFromSearch,
  );
  // Mode de consultation choisi : présentiel (cabinet) ou téléconsultation (video)
  const [consultType, setConsultType] = useState<"cabinet" | "video">("cabinet");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // ================== FETCH DOCTOR ==================
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const snap = await getDoc(doc(db, "doctors", id as string));
        if (snap.exists()) {
          const raw = snap.data();
          setDoctor({
            id: snap.id,
            name: raw.name || "",
            specialty: raw.specialty || "",
            city: raw.city || "",
            image: raw.image || "",
            rating: Number(raw.rating) || 4.5,
            reviews: raw.reviews || 50,
            workingHours: cleanWorkingHours(raw.workingHours),
            bio: raw.bio || raw.description || "",
            address: raw.address || "",
            phone: raw.phone || "",
            languages: Array.isArray(raw.languages) ? raw.languages : [],
            experience: Number(raw.experience) || 0,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  // ================== REALTIME BOOKED SLOTS ==================
  // Créneaux pris via la collection publique bookedSlots (aucune
  // donnée personnelle — les RDV eux-mêmes ne sont plus lisibles ici).
  useEffect(() => {
    if (!doctor?.id) return;
    const unsub = listenDoctorBookedSlots(doctor.id, setBookedTimes);
    return () => unsub();
  }, [doctor?.id]);

  // ================== REALTIME REVIEWS ==================
  useEffect(() => {
    if (!doctor?.id) return;
    const q = query(
      collection(db, "reviews"),
      where("doctorId", "==", doctor.id),
    );
    const unsub = onSnapshot(q, (snap) => {
      const data: Review[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
      }));
      // Tri par date décroissante (plus récent en premier), côté client
      data.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return tb - ta;
      });
      setReviews(data);
      setLoadingReviews(false);
    });
    return () => unsub();
  }, [doctor?.id]);

  // Note affichée : moyenne réelle si avis, sinon valeur du profil
  const realAvg = averageRating(reviews);
  const displayRating = reviews.length > 0 ? realAvg : doctor?.rating || 0;
  const displayCount = reviews.length > 0 ? reviews.length : doctor?.reviews || 0;

  // ================== BOOKED SLOTS ==================
  const bookedSet = bookedTimes;

  // ================== DEFAULT SELECTED DATE ==================
  // Si on arrive avec un créneau → on prend son jour.
  // Sinon → premier des 7 prochains jours qui a des disponibilités.
  useEffect(() => {
    if (!doctor || selectedDate) return;

    if (slotFromSearch) {
      setSelectedDate(new Date(slotFromSearch).toLocaleDateString("en-CA"));
      return;
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split("T")[0];
      const ranges = doctor.workingHours?.[getDayName(ds)] || [];
      const free = generateSlots(ds, ranges).filter((s) => !bookedSet.has(s));
      if (free.length > 0) {
        setSelectedDate(ds);
        break;
      }
    }
  }, [doctor, slotFromSearch, selectedDate, bookedSet]);

  // ================== SLOTS DU JOUR ==================
  const daySlots = useMemo(() => {
    if (!selectedDate || !doctor?.workingHours) return [];
    const ranges = doctor.workingHours[getDayName(selectedDate)] || [];
    return generateSlots(selectedDate, ranges);
  }, [selectedDate, doctor]);

  // ================== GARDES RÉSERVATION ==================
  const isSlotPast = !!selectedSlot && selectedSlot < Date.now();
  const slotTaken = !!selectedSlot && bookedSet.has(selectedSlot);
  const canConfirm = !!selectedSlot && !slotTaken && !isSlotPast;

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // ── Contacter le médecin par messagerie ──
  const handleMessage = async () => {
    if (!doctor) return;
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/doctor/${doctor.id}`)}`,
      );
      return;
    }
    try {
      const convId = await getOrCreateConversation({
        patientId: user.uid,
        doctorId: doctor.id,
        patientName: user.displayName || user.email || "Patient",
        doctorName: doctor.name,
        specialty: doctor.specialty,
      });
      router.push(`/messages?c=${convId}`);
    } catch (e) {
      console.error("Erreur ouverture messagerie:", e);
    }
  };

  const handleConfirmClick = () => {
    if (!canConfirm || !doctor) return;
    const paymentPath =
      `/payment?doctorId=${doctor.id}&date=${selectedSlot}` +
      `&doctorName=${encodeURIComponent(doctor.name)}` +
      `&specialty=${encodeURIComponent(doctor.specialty)}` +
      `&city=${encodeURIComponent(doctor.city)}` +
      `&type=${consultType}`;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(paymentPath)}`);
      return;
    }
    router.push(paymentPath);
  };

  // ================== LOADING / NOT FOUND ==================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement du profil...</p>
        </div>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-700 font-medium">Médecin introuvable</p>
        <button
          onClick={() => router.push("/search")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour à la recherche
        </button>
      </main>
    );
  }

  // Nombre total de créneaux libres ce jour
  const freeToday = daySlots.filter((s) => !bookedSet.has(s)).length;
  const dayRanges = doctor.workingHours?.[getDayName(selectedDate || "")] || [];
  const allSlotsPast = dayRanges.length > 0 && daySlots.length === 0;

  // ================== UI ==================
  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Barre supérieure ── */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
          <button
            onClick={() => router.push("/search")}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Retour à la recherche
          </button>
          <span
            onClick={() => router.push("/")}
            className="text-blue-700 font-bold cursor-pointer"
          >
            Doctolib Guinée
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-8">
        {/* ════════ COLONNE PRINCIPALE ════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── En-tête profil ── */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doctor.image || "/default-doctor.png"}
                alt={doctor.name}
                className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 mx-auto sm:mx-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {doctor.name}
                  </h1>
                  {/* Badge vérifié */}
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    ✓ Vérifié
                  </span>
                </div>
                <p className="text-blue-600 font-medium mt-1">
                  {doctor.specialty}
                </p>
                <p className="text-gray-400 text-sm mt-1">📍 {doctor.city}</p>

                {/* Stats */}
                <div className="flex items-center justify-center sm:justify-start gap-5 mt-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">
                        {displayRating.toFixed(1)}
                      </span>
                      <StarRating rating={displayRating} size={15} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {displayCount} avis
                    </p>
                  </div>
                  {doctor.experience ? (
                    <div className="border-l border-gray-100 pl-5">
                      <p className="text-lg font-bold text-gray-900">
                        {doctor.experience} ans
                      </p>
                      <p className="text-xs text-gray-400">d&apos;expérience</p>
                    </div>
                  ) : null}
                </div>

                {/* Contacter par messagerie */}
                <button
                  onClick={handleMessage}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
                >
                  💬 Envoyer un message
                </button>
              </div>
            </div>
          </section>

          {/* ── À propos ── */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">À propos</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {doctor.bio
                ? doctor.bio
                : `Le Dr ${doctor.name} est ${doctor.specialty.toLowerCase()} et exerce à ${doctor.city}. Praticien vérifié sur Doctolib Guinée, il accueille ses patients en consultation et assure un suivi de qualité.`}
            </p>
          </section>

          {/* ── Informations pratiques ── */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">
              Informations pratiques
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-gray-800 font-medium">Adresse</p>
                  <p className="text-gray-500">
                    {doctor.address
                      ? `${doctor.address}, ${doctor.city}`
                      : doctor.city}
                  </p>
                </div>
              </li>
              {doctor.phone ? (
                <li className="flex items-start gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-gray-800 font-medium">Téléphone</p>
                    <p className="text-gray-500">{doctor.phone}</p>
                  </div>
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <span className="text-lg">🗣️</span>
                <div>
                  <p className="text-gray-800 font-medium">Langues parlées</p>
                  <p className="text-gray-500">
                    {doctor.languages && doctor.languages.length > 0
                      ? doctor.languages.join(", ")
                      : "Français"}
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* ── Horaires de consultation ── */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">
              Horaires de consultation
            </h2>
            <ul className="divide-y divide-gray-50">
              {DAYS.map((day) => {
                const ranges = doctor.workingHours?.[day.key] || [];
                const open = ranges.length > 0;
                return (
                  <li
                    key={day.key}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="text-gray-700 font-medium">
                      {day.label}
                    </span>
                    <span
                      className={open ? "text-gray-600" : "text-gray-300"}
                    >
                      {open ? ranges.join("  ·  ") : "Fermé"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ── Avis des patients ── */}
          <ReviewsList reviews={reviews} loading={loadingReviews} />
        </div>

        {/* ════════ WIDGET DE RÉSERVATION (sticky) ════════ */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24 space-y-4">
            <h2 className="font-semibold text-gray-900">Prendre rendez-vous</h2>

            {/* Mode de consultation : cabinet ou téléconsultation */}
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "cabinet", label: "Au cabinet", icon: "🏥" },
                { key: "video", label: "En visio", icon: "📹" },
              ] as const).map((opt) => {
                const active = consultType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setConsultType(opt.key)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      active
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {consultType === "video" && (
              <p className="text-[11px] text-gray-400 -mt-1">
                Consultation par vidéo. Un lien sécurisé sera disponible depuis
                votre espace le jour du rendez-vous.
              </p>
            )}

            {/* Choix du jour */}
            <DayStrip
              doctor={doctor}
              bookedSet={bookedSet}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />

            {/* Badge disponibilités */}
            {selectedDate && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "fr-FR",
                    { weekday: "long", day: "numeric", month: "long" },
                  )}
                </p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    freeToday > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {freeToday > 0 ? `${freeToday} disponibles` : "Complet"}
                </span>
              </div>
            )}

            {/* Grille de créneaux */}
            {selectedDate && daySlots.length > 0 && (
              <SlotGrid
                slots={daySlots}
                bookedSet={bookedSet}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            )}

            {selectedDate && daySlots.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-3">
                {allSlotsPast
                  ? "Plus de créneaux disponibles aujourd'hui"
                  : "Pas de consultation ce jour"}
              </p>
            )}

            <hr className="border-gray-100" />

            {/* Récap créneau sélectionné */}
            <SelectedSlot slot={selectedSlot} />

            {/* Messages */}
            {isSlotPast && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                Ce créneau est déjà passé. Choisissez-en un autre.
              </div>
            )}
            {!isSlotPast && !user && selectedSlot && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-xl">
                Vous serez invité à vous connecter pour finaliser.
              </div>
            )}

            {/* Bouton confirmer */}
            <button
              onClick={handleConfirmClick}
              disabled={!canConfirm}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                canConfirm
                  ? "bg-blue-700 hover:bg-blue-800 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedSlot
                ? `Confirmer · ${new Date(selectedSlot).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Sélectionnez un créneau"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
