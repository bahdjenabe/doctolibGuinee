"use client";

// ============================================================
// RESCHEDULE MODAL — components/dashboard/RescheduleModal.tsx
// Modal de reprogrammation d'un rendez-vous.
//
// Le patient choisit un nouveau créneau chez le MÊME médecin.
// La modal charge elle-même :
//   - les horaires du médecin (getDoc doctors/{id})
//   - les créneaux déjà pris du médecin (onSnapshot appointments)
//     → en excluant le RDV en cours de reprogrammation
//
// Réutilise DayStrip + SlotGrid (cohérence avec le tunnel de RDV).
// Le paiement n'est PAS redemandé : le RDV est déjà payé.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Doctor } from "@/types/doctor";
import { Appointment } from "@/types/appointment";
import {
  cleanWorkingHours,
  generateSlots,
  getDayName,
  normalizeTime,
} from "@/lib/slots";
import { formatDate } from "@/lib/dashboard";

import DayStrip from "@/components/search/Daystrip";
import SlotGrid from "@/components/search/SlotGrid";

type Props = {
  appointment: Appointment; // RDV à reprogrammer
  rescheduling: boolean; // true pendant l'écriture Firestore
  error: string; // message d'erreur éventuel
  onConfirm: (newSlot: number) => void; // confirme avec le nouveau créneau (ms)
  onClose: () => void; // ferme sans reprogrammer
};

export default function RescheduleModal({
  appointment,
  rescheduling,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // ── Charge le médecin du RDV ──
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const snap = await getDoc(doc(db, "doctors", appointment.doctorId));
        if (snap.exists()) {
          const raw = snap.data();
          setDoctor({
            id: snap.id,
            name: raw.name || appointment.doctorName,
            specialty: raw.specialty || appointment.specialty,
            city: raw.city || appointment.city,
            image: raw.image || "",
            rating: Number(raw.rating) || 4.5,
            reviews: raw.reviews || 50,
            workingHours: cleanWorkingHours(raw.workingHours),
          });
        }
      } catch (err) {
        console.error("Erreur chargement médecin:", err);
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [appointment]);

  // ── Écoute les RDV du médecin (créneaux pris) ──
  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", appointment.doctorId),
    );
    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [appointment.doctorId]);

  // ── Créneaux pris (hors annulés et hors le RDV en cours de repro) ──
  const bookedSet = useMemo(
    () =>
      new Set<number>(
        appointments
          .filter(
            (a) =>
              a.status !== "cancelled" && a.id !== appointment.id,
          )
          .map((a) => normalizeTime(a.date))
          .filter((t): t is number => t !== null),
      ),
    [appointments, appointment.id],
  );

  // ── Créneaux du jour sélectionné ──
  const daySlots = useMemo(() => {
    if (!selectedDate || !doctor?.workingHours) return [];
    const ranges = doctor.workingHours[getDayName(selectedDate)] || [];
    return generateSlots(selectedDate, ranges);
  }, [selectedDate, doctor]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* En-tête */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Reprogrammer le rendez-vous
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {appointment.doctorName} · {appointment.specialty}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Créneau actuel : {formatDate(appointment.date)}
            </p>
          </div>

          {/* Chargement médecin */}
          {loadingDoctor ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !doctor ? (
            <p className="text-sm text-red-500 text-center py-6">
              Impossible de charger les disponibilités du médecin.
            </p>
          ) : (
            <>
              {/* Choix de la date */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Nouvelle date
                </p>
                <DayStrip
                  doctor={doctor}
                  bookedSet={bookedSet}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />
              </div>

              {/* Choix du créneau */}
              {selectedDate && daySlots.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Nouveau créneau
                  </p>
                  <SlotGrid
                    slots={daySlots}
                    bookedSet={bookedSet}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                </div>
              )}

              {selectedDate && daySlots.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-3">
                  Aucun créneau disponible ce jour
                </p>
              )}

              {!selectedDate && (
                <p className="text-sm text-gray-400 text-center py-3">
                  Choisissez une date pour voir les créneaux
                </p>
              )}
            </>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-1">
            <button
              disabled={rescheduling}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              disabled={!selectedSlot || rescheduling}
              onClick={() => selectedSlot && onConfirm(selectedSlot)}
              className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                selectedSlot && !rescheduling
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {rescheduling ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reprogrammation...
                </span>
              ) : (
                "Confirmer le nouveau créneau"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
