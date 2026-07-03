"use client";

// ============================================================
// SALLE DE TÉLÉCONSULTATION — /consultation/[id]/page.tsx
// ============================================================
//
// [id] = ID du rendez-vous (= ID du doc "consultations").
//
// Parcours :
//   - Charge le RDV, vérifie que c'est une visio et que l'utilisateur
//     en est bien participant (patient OU médecin).
//   - Respecte la fenêtre d'accès (15 min avant → 60 min après).
//   - Salle d'attente → "Rejoindre" → connexion WebRTC (useVideoCall).
//   - Contrôles : micro, caméra, raccrocher.
//   - Après l'appel : écran de fin.
//
// Rôles WebRTC : patient = appelant, médecin = appelé.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Appointment } from "@/types/appointment";
import { formatDate } from "@/lib/dashboard";
import { joinWindow } from "@/lib/consultation";
import { useVideoCall, CallRole } from "@/hooks/useVideoCall";
import PrescriptionModal from "@/components/documents/PrescriptionModal";

// ── Petit composant vidéo qui branche un MediaStream sur un <video> ──
function VideoTile({
  stream,
  muted,
  className,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}

function ConsultationRoom() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [joined, setJoined] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  // ── Chargement du RDV + contrôle d'accès ──
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "appointments", id as string));
        if (!snap.exists()) {
          setNotAllowed(true);
          return;
        }
        const data = { id: snap.id, ...(snap.data() as any) } as Appointment;
        const isParticipant =
          data.patientId === user.uid || data.doctorId === user.uid;
        if (!isParticipant || data.type !== "video") {
          setNotAllowed(true);
          return;
        }
        setAppt(data);
      } catch (e) {
        console.error(e);
        setNotAllowed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  // Rôle : patient = appelant, médecin = appelé
  const role: CallRole | null = appt
    ? appt.patientId === user?.uid
      ? "caller"
      : "callee"
    : null;

  const participantIds =
    appt?.patientId && appt?.doctorId
      ? [appt.patientId, appt.doctorId]
      : [];

  const call = useVideoCall(id as string, role, participantIds, joined);

  // ── États de chargement / accès ──
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  if (notAllowed || !appt) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-900 text-white px-6 text-center">
        <div className="text-4xl">🔒</div>
        <p className="font-medium">Consultation indisponible</p>
        <p className="text-sm text-white/60 max-w-sm">
          Ce lien de téléconsultation n&apos;est pas valide ou vous n&apos;êtes
          pas autorisé à y accéder.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-blue-300 hover:underline mt-2"
        >
          ← Retour au tableau de bord
        </button>
      </main>
    );
  }

  const isDoctor = appt.doctorId === user?.uid;
  const otherName = isDoctor
    ? appt.patientName || "le patient"
    : appt.doctorName || "le médecin";

  const win = joinWindow(appt.date);

  // ── Écran de fin d'appel ──
  if (call.status === "ended") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-900 text-white px-6 text-center">
        <div className="text-4xl">👋</div>
        <p className="font-semibold text-lg">Consultation terminée</p>
        <p className="text-sm text-white/60">
          Merci d&apos;avoir utilisé la téléconsultation Doctolib Guinée.
        </p>
        <button
          onClick={() => router.push(isDoctor ? `/admin/doctor/${appt.doctorId}/dashboardDoctor` : "/dashboard")}
          className="mt-3 bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Retour à mon espace
        </button>
      </main>
    );
  }

  // ── Salle d'attente (avant de rejoindre) ──
  if (!joined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center text-2xl mb-5">
            📹
          </div>
          <h1 className="text-xl font-bold">Téléconsultation</h1>
          <p className="text-white/60 text-sm mt-1">
            avec {isDoctor ? appt.patientName : appt.doctorName}
          </p>
          <p className="text-white/40 text-xs mt-1">{appt.specialty}</p>

          <div className="mt-5 bg-white/5 rounded-xl px-4 py-3 text-sm text-white/70">
            🗓️ {formatDate(appt.date)}
          </div>

          {win.tooEarly ? (
            <div className="mt-6">
              <p className="text-amber-300 text-sm">
                La salle ouvrira 15 min avant l&apos;heure du rendez-vous.
              </p>
              {win.minutesUntil > 0 && (
                <p className="text-white/40 text-xs mt-1">
                  Ouverture dans environ {win.minutesUntil} min.
                </p>
              )}
            </div>
          ) : win.tooLate ? (
            <p className="mt-6 text-red-300 text-sm">
              Le créneau de cette téléconsultation est dépassé.
            </p>
          ) : (
            <>
              <p className="text-white/50 text-xs mt-6">
                Vérifiez votre caméra et votre micro. En rejoignant, vous
                autorisez l&apos;accès à votre webcam.
              </p>
              <button
                onClick={() => setJoined(true)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl font-semibold text-sm"
              >
                🎥 Rejoindre la consultation
              </button>
            </>
          )}

          <button
            onClick={() => router.push(isDoctor ? `/admin/doctor/${appt.doctorId}/dashboardDoctor` : "/dashboard")}
            className="mt-4 text-xs text-white/40 hover:text-white/70"
          >
            Retour à mon espace
          </button>
        </div>
      </main>
    );
  }

  // ── En appel ──
  const waiting = call.status !== "connected";

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between px-5 py-3 text-white/80">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Téléconsultation · {appt.specialty}
        </div>
        <span className="text-xs text-white/40">{formatDate(appt.date)}</span>
      </div>

      {/* Zone vidéo */}
      <div className="flex-1 relative flex items-center justify-center px-4">
        {/* Flux distant */}
        <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/10">
          {call.status === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 px-6">
              <div className="text-3xl">⚠️</div>
              <p className="text-white/80 text-sm">{call.errorMsg}</p>
            </div>
          ) : waiting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl">
                {otherName.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                En attente de {otherName}…
              </div>
            </div>
          ) : (
            <VideoTile
              stream={call.remoteStream}
              className="w-full h-full object-cover"
            />
          )}

          {/* Vignette locale (PiP) */}
          <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video bg-gray-800 rounded-xl overflow-hidden border border-white/20 shadow-lg">
            {call.camOn ? (
              <VideoTile
                stream={call.localStream}
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                Caméra coupée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre de contrôles */}
      <div className="flex items-center justify-center gap-4 py-6">
        <button
          onClick={call.toggleMic}
          title={call.micOn ? "Couper le micro" : "Activer le micro"}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
            call.micOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-500 text-white"
          }`}
        >
          {call.micOn ? "🎙️" : "🔇"}
        </button>

        <button
          onClick={call.toggleCam}
          title={call.camOn ? "Couper la caméra" : "Activer la caméra"}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
            call.camOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-500 text-white"
          }`}
        >
          {call.camOn ? "📹" : "🚫"}
        </button>

        <button
          onClick={() => router.push("/messages")}
          title="Ouvrir la messagerie"
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl bg-white/15 text-white hover:bg-white/25"
        >
          💬
        </button>

        {/* Ordonnance — réservé au médecin */}
        {isDoctor && (
          <button
            onClick={() => setShowPrescription(true)}
            title="Rédiger une ordonnance"
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl bg-white/15 text-white hover:bg-white/25"
          >
            💊
          </button>
        )}

        <button
          onClick={call.hangUp}
          title="Raccrocher"
          className="w-16 h-14 rounded-full flex items-center justify-center text-xl bg-red-600 text-white hover:bg-red-700"
        >
          📞
        </button>
      </div>

      {/* Modal ordonnance (médecin) */}
      {showPrescription && appt.patientId && (
        <PrescriptionModal
          doctorId={appt.doctorId}
          doctorName={appt.doctorName}
          specialty={appt.specialty}
          patientId={appt.patientId}
          patientName={appt.patientName || "Patient"}
          appointmentId={appt.id}
          onClose={() => setShowPrescription(false)}
        />
      )}
    </main>
  );
}

export default function ConsultationPage() {
  return (
    <ProtectedRoute>
      <ConsultationRoom />
    </ProtectedRoute>
  );
}
