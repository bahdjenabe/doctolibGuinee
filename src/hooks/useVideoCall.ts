"use client";

// ============================================================
// HOOK useVideoCall — src/hooks/useVideoCall.ts
// ============================================================
//
// Encapsule tout le cycle de vie d'un appel vidéo WebRTC dont la
// signalisation passe par Firestore (voir src/lib/consultation.ts).
//
//   - role "caller" (patient) : crée l'offre, attend la réponse
//   - role "callee" (médecin) : attend l'offre, renvoie la réponse
//
// Retourne les flux local/distant, l'état de connexion et les
// contrôles (micro, caméra, raccrocher).
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ICE_SERVERS } from "@/lib/consultation";

export type CallRole = "caller" | "callee";
export type CallStatus =
  | "idle"
  | "connecting"
  | "waiting"
  | "connected"
  | "ended"
  | "error";

export function useVideoCall(
  consultationId: string,
  role: CallRole | null,
  participantIds: string[],
  active: boolean,
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);

  const cleanup = useCallback(() => {
    unsubsRef.current.forEach((u) => u());
    unsubsRef.current = [];
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  }, []);

  useEffect(() => {
    if (!active || !role || !consultationId) return;
    let cancelled = false;

    (async () => {
      setStatus("connecting");
      try {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // ── Média local (caméra + micro), avec repli audio seul ──
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
            setCamOn(false);
          } catch {
            setErrorMsg(
              "Impossible d'accéder à la caméra ou au micro. Vérifiez les autorisations du navigateur.",
            );
            setStatus("error");
            return;
          }
        }

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        // ── Flux distant ──
        const remote = new MediaStream();
        setRemoteStream(remote);
        pc.ontrack = (ev) => {
          ev.streams[0]?.getTracks().forEach((t) => remote.addTrack(t));
          setStatus("connected");
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setStatus("connected");
          if (pc.connectionState === "failed") {
            setErrorMsg("La connexion a échoué. Réessayez.");
            setStatus("error");
          }
        };

        // ── Références Firestore de signalisation ──
        const callDoc = doc(db, "consultations", consultationId);
        const callerCand = collection(callDoc, "callerCandidates");
        const calleeCand = collection(callDoc, "calleeCandidates");

        // Le doc de salle doit exister AVEC participantIds (règles de sécurité)
        // avant toute écriture d'offre/réponse.
        await setDoc(
          callDoc,
          { participantIds, startedAt: serverTimestamp() },
          { merge: true },
        );

        if (role === "caller") {
          pc.onicecandidate = (e) => {
            if (e.candidate) addDoc(callerCand, e.candidate.toJSON());
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await setDoc(
            callDoc,
            { offer: { type: offer.type, sdp: offer.sdp } },
            { merge: true },
          );
          setStatus("waiting");

          // Attend la réponse du médecin
          const u1 = onSnapshot(callDoc, (snap) => {
            const data = snap.data();
            if (data?.answer && !pc.currentRemoteDescription) {
              pc.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(
                (e) => console.error("[useVideoCall] setRemoteDescription", e),
              );
            }
          });
          const u2 = onSnapshot(calleeCand, (snap) => {
            snap.docChanges().forEach((ch) => {
              if (ch.type === "added") {
                pc.addIceCandidate(new RTCIceCandidate(ch.doc.data())).catch(
                  () => {},
                );
              }
            });
          });
          unsubsRef.current.push(u1, u2);
        } else {
          pc.onicecandidate = (e) => {
            if (e.candidate) addDoc(calleeCand, e.candidate.toJSON());
          };
          setStatus("waiting");

          let answered = false;
          const u1 = onSnapshot(callDoc, async (snap) => {
            const data = snap.data();
            if (data?.offer && !answered) {
              answered = true;
              try {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(data.offer),
                );
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await updateDoc(callDoc, {
                  answer: { type: answer.type, sdp: answer.sdp },
                });
              } catch (e) {
                console.error("[useVideoCall] answer", e);
              }
            }
          });
          const u2 = onSnapshot(callerCand, (snap) => {
            snap.docChanges().forEach((ch) => {
              if (ch.type === "added") {
                pc.addIceCandidate(new RTCIceCandidate(ch.doc.data())).catch(
                  () => {},
                );
              }
            });
          });
          unsubsRef.current.push(u1, u2);
        }
      } catch (e) {
        console.error("[useVideoCall] init", e);
        setErrorMsg("Erreur lors de l'établissement de la connexion vidéo.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, role, consultationId]);

  const toggleMic = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const next = !micOn;
    s.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  }, [micOn]);

  const toggleCam = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const next = !camOn;
    s.getVideoTracks().forEach((t) => (t.enabled = next));
    setCamOn(next);
  }, [camOn]);

  const hangUp = useCallback(() => {
    cleanup();
    setStatus("ended");
  }, [cleanup]);

  return {
    localStream,
    remoteStream,
    status,
    micOn,
    camOn,
    errorMsg,
    toggleMic,
    toggleCam,
    hangUp,
  };
}
