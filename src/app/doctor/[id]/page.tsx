"use client";

// ============================================================
// PAGE CONFIRMATION — /doctor/[id]/page.tsx
// Version propre + UI améliorée
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { generateSlots, normalizeTime, cleanWorkingHours } from "@/lib/slots";

// Components
import DoctorProfile from "@/components/confirmation/DoctorProfile";
import SelectedSlot from "@/components/confirmation/SelectedSlot";
import SlotPicker from "@/components/confirmation/SlotPicker";
import ConfirmModal from "@/components/confirmation/ConfirmModal";
import ProtectedRoute from "@/components/ProtectedRoute";

// ============================================================
// TYPE
// ============================================================

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  image?: string;
  rating?: number;
  reviews?: number;
  workingHours?: { [key: string]: string[] };
};

const DAY_NAMES_EN = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

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
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(
    slotFromSearch,
  );

  const [openModal, setOpenModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  // ================== REALTIME APPOINTMENTS ==================
  useEffect(() => {
    if (!doctor?.id) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctor.id),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [doctor?.id]);

  // ================== BOOKED SLOTS ==================
  const bookedSet = new Set<number>(
    appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => normalizeTime(a.date))
      .filter((t): t is number => t !== null),
  );

  // ================== GENERATE SLOTS ==================
  const getSlotsForDay = () => {
    if (!selectedSlot || !doctor?.workingHours) {
      return { matin: [], apresmidi: [] };
    }

    const dateStr = new Date(selectedSlot).toLocaleDateString("en-CA");
    const dn = DAY_NAMES_EN[new Date(dateStr + "T12:00:00").getDay()];

    const ranges = doctor.workingHours[dn] || [];
    const all = generateSlots(dateStr, ranges);

    return {
      matin: all.filter((s) => new Date(s).getHours() < 13),
      apresmidi: all.filter((s) => new Date(s).getHours() >= 13),
    };
  };

  const { matin, apresmidi } = getSlotsForDay();

  // ================== CLICK CONFIRM ==================
  // const handleConfirmClick = () => {
  //   if (!selectedSlot) return;
  //
  //   if (!user) {
  //     const currentPath = `/doctor/${id}?date=${selectedSlot}`;
  //     router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  //     return;
  //   }
  //
  //   setOpenModal(true);
  // };

  const handleConfirmClick = () => {
    if (!selectedSlot || !doctor) return;

    // Non connecté → /login avec redirect vers /payment
    if (!user) {
      const paymentPath = `/payment?doctorId=${doctor.id}&date=${selectedSlot}&doctorName=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}&city=${encodeURIComponent(doctor.city)}`;
      router.push(`/login?redirect=${encodeURIComponent(paymentPath)}`);
      return;
    }

    // Connecté → page de paiement avec tous les paramètres
    router.push(
      `/payment?doctorId=${doctor.id}&date=${selectedSlot}&doctorName=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}&city=${encodeURIComponent(doctor.city)}`,
    );
  };

  // ================== CONFIRM APPOINTMENT ==================
  const handleConfirmAppointment = async () => {
    if (!doctor || !selectedSlot || !user) return;

    setConfirming(true);
    setError("");

    try {
      const d = new Date(selectedSlot);
      const pad = (n: number) => String(n).padStart(2, "0");

      const dateString =
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000`;

      const q = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctor.id),
        where("date", "==", dateString),
        where("status", "==", "confirmed"),
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setError("❌ Ce créneau vient d'être pris.");
        setConfirming(false);
        return;
      }

      await addDoc(collection(db, "appointments"), {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        city: doctor.city,
        date: dateString,
        patientId: user.uid,
        patientName: user.displayName || user.email || "Patient",
        status: "confirmed",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);

      setTimeout(() => {
        setOpenModal(false);
        setSuccess(false);
        router.push("/dashboard");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("Erreur, réessayez.");
    } finally {
      setConfirming(false);
    }
  };

  // ================== LOADING ==================
  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Chargement...</p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!doctor) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex items-center justify-center">
          <p>Médecin introuvable</p>
        </main>
      </ProtectedRoute>
    );
  }

  // ================== UI ==================
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Confirmation du rendez-vous
            </h1>
            <p className="text-gray-500 text-sm">
              Vérifiez les informations avant de confirmer
            </p>
          </div>

          {/* DOCTOR */}
          <DoctorProfile doctor={doctor} />

          {/* CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-md space-y-6">
            <SelectedSlot slot={selectedSlot} />

            <SlotPicker
              matin={matin}
              apresmidi={apresmidi}
              bookedSet={bookedSet}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />

            {!user && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-xl">
                Vous devez être connecté
              </div>
            )}

            <button
              onClick={handleConfirmClick}
              disabled={!selectedSlot || bookedSet.has(selectedSlot!)}
              className={`w-full py-4 rounded-xl font-semibold ${
                selectedSlot && !bookedSet.has(selectedSlot)
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              Confirmer
            </button>

            <button
              onClick={() => router.back()}
              className="w-full text-sm text-gray-500"
            >
              ← Retour
            </button>
          </div>
        </div>

        {/* MODAL */}
        {openModal && doctor && (
          <ConfirmModal
            doctor={doctor}
            slot={selectedSlot}
            patientName={user?.displayName || "Patient"}
            confirming={confirming}
            success={success}
            error={error}
            onConfirm={handleConfirmAppointment}
            onClose={() => setOpenModal(false)}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
