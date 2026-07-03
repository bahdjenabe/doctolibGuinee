// ============================================================
// HELPERS MESSAGERIE — src/lib/messaging.ts
// ============================================================
//
// Modèle Firestore :
//   conversations/{convId} {
//     participants: [patientId, doctorId]   // UID Auth
//     patientId, doctorId, patientName, doctorName, specialty
//     lastMessage, lastSenderId, updatedAt
//     unread: { [uid]: number }             // compteur de non-lus
//   }
//   conversations/{convId}/messages/{id} { senderId, senderName, text, createdAt }
//
// convId est déterministe : `${patientId}__${doctorId}` — garantit
// une seule conversation par couple patient/médecin.
// ============================================================

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Conversation, Message } from "@/types/message";

// ── ID déterministe d'une conversation ──
export function conversationId(patientId: string, doctorId: string): string {
  return `${patientId}__${doctorId}`;
}

// ── Crée la conversation si elle n'existe pas, renvoie son ID ──
export async function getOrCreateConversation(params: {
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  specialty?: string;
}): Promise<string> {
  const { patientId, doctorId, patientName, doctorName, specialty } = params;
  const convId = conversationId(patientId, doctorId);
  const ref = doc(db, "conversations", convId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [patientId, doctorId],
      patientId,
      doctorId,
      patientName,
      doctorName,
      specialty: specialty || "",
      lastMessage: "",
      lastSenderId: "",
      unread: { [patientId]: 0, [doctorId]: 0 },
      updatedAt: serverTimestamp(),
    });
  }
  return convId;
}

// ── Envoie un message + met à jour le récap de la conversation ──
export async function sendMessage(
  conv: Conversation,
  sender: { id: string; name: string },
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const convRef = doc(db, "conversations", conv.id);
  const messagesRef = collection(convRef, "messages");

  await addDoc(messagesRef, {
    senderId: sender.id,
    senderName: sender.name,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  // Incrémente les non-lus du destinataire (l'autre participant).
  const otherId = conv.participants.find((p) => p !== sender.id);
  const patch: Record<string, any> = {
    lastMessage: trimmed,
    lastSenderId: sender.id,
    updatedAt: serverTimestamp(),
  };
  if (otherId) patch[`unread.${otherId}`] = increment(1);

  await updateDoc(convRef, patch);
}

// ── Écoute temps réel des conversations d'un utilisateur ──
export function listenConversations(
  uid: string,
  cb: (convs: Conversation[]) => void,
) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
  );
  return onSnapshot(q, (snap) => {
    const data: Conversation[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Conversation, "id">),
    }));
    // Tri par date décroissante côté client (évite l'index composite).
    data.sort((a, b) => {
      const ta = a.updatedAt?.toDate?.()?.getTime() || 0;
      const tb = b.updatedAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });
    cb(data);
  });
}

// ── Écoute temps réel des messages d'une conversation ──
export function listenMessages(
  convId: string,
  cb: (messages: Message[]) => void,
) {
  const q = collection(db, "conversations", convId, "messages");
  return onSnapshot(q, (snap) => {
    const data: Message[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Message, "id">),
    }));
    data.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return ta - tb; // ordre chronologique
    });
    cb(data);
  });
}

// ── Remet à zéro les non-lus de l'utilisateur sur une conversation ──
export async function markConversationRead(
  convId: string,
  uid: string,
): Promise<void> {
  try {
    await updateDoc(doc(db, "conversations", convId), {
      [`unread.${uid}`]: 0,
    });
  } catch (e) {
    console.error("[messaging] markConversationRead", e);
  }
}
