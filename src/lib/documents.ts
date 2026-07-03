// ============================================================
// HELPERS DOCUMENTS & ORDONNANCES — src/lib/documents.ts
// ============================================================
//
// Ordonnances (collection "prescriptions") : structurées, rédigées
// par le médecin, consultées + imprimées par le patient. Immuables.
//
// Documents (collection "documents") : fichiers déposés par le patient
// (analyses, imagerie…). Le fichier est encodé en base64 et stocké
// DANS le document Firestore (champ dataUrl) — Firebase Storage
// nécessite le forfait Blaze, non activé sur le projet.
// Limite Firestore : 1 Mo/document → fichier source ≤ ~700 Ko ;
// les images sont recompressées automatiquement côté navigateur.
// ============================================================

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Prescription,
  PatientDocument,
  Medication,
  DocumentCategory,
} from "@/types/document";


// ════════════════════════════════════════════════════════
// ORDONNANCES
// ════════════════════════════════════════════════════════

// Le médecin crée une ordonnance pour un patient.
export async function createPrescription(params: {
  doctorId: string;
  doctorName: string;
  specialty?: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  medications: Medication[];
  notes?: string;
}): Promise<string> {
  const now = new Date();
  const ref = await addDoc(collection(db, "prescriptions"), {
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    specialty: params.specialty || "",
    patientId: params.patientId,
    patientName: params.patientName,
    appointmentId: params.appointmentId || "",
    date: now.toISOString(),
    medications: params.medications,
    notes: params.notes || "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Écoute des ordonnances d'un utilisateur (patient OU médecin).
export function listenPrescriptions(
  uid: string,
  role: "patient" | "doctor",
  cb: (list: Prescription[]) => void,
) {
  const field = role === "doctor" ? "doctorId" : "patientId";
  const q = query(collection(db, "prescriptions"), where(field, "==", uid));
  return onSnapshot(q, (snap) => {
    const data: Prescription[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Prescription, "id">),
    }));
    data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    cb(data);
  });
}

// ════════════════════════════════════════════════════════
// DOCUMENTS (fichiers)
// ════════════════════════════════════════════════════════

// Taille max du champ dataUrl pour rester sous la limite Firestore
// de 1 Mo par document (marge pour les autres champs).
const MAX_DATAURL_CHARS = 950_000;

// Taille max « brute » acceptée pour un fichier non compressible (PDF).
// base64 gonfle de ~33 % : 700 Ko → ~933 Ko encodés.
export const MAX_FILE_BYTES = 700 * 1024;

// Erreur levée quand le fichier est trop lourd (message affichable tel quel).
export class FileTooLargeError extends Error {}

// Lit un fichier en data URL (base64).
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Recompresse une image dans un canvas jusqu'à passer sous la limite :
// redimensionne à max 1600 px puis baisse la qualité JPEG par paliers.
async function compressImageToDataUrl(file: File): Promise<string> {
  const original = await fileToDataUrl(file);
  if (original.length <= MAX_DATAURL_CHARS) return original;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Image illisible"));
    el.src = original;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponible");

  for (const maxDim of [1600, 1200, 900, 600]) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.fillStyle = "#fff"; // fond blanc pour les PNG transparents
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const out = canvas.toDataURL("image/jpeg", quality);
      if (out.length <= MAX_DATAURL_CHARS) return out;
    }
  }

  throw new FileTooLargeError(
    "Impossible de compresser suffisamment cette image.",
  );
}

// Dépose un fichier : encodage base64 + document Firestore.
export async function uploadDocument(params: {
  ownerId: string;
  patientId: string;
  file: File;
  category: DocumentCategory;
  label?: string;
}): Promise<void> {
  const { ownerId, patientId, file, category, label } = params;

  let dataUrl: string;
  let contentType = file.type;

  if (file.type.startsWith("image/")) {
    dataUrl = await compressImageToDataUrl(file);
    // La compression peut convertir en JPEG.
    if (dataUrl.startsWith("data:image/jpeg")) contentType = "image/jpeg";
  } else {
    // PDF et autres : pas de compression possible côté navigateur.
    if (file.size > MAX_FILE_BYTES) {
      throw new FileTooLargeError(
        `Ce fichier dépasse ${Math.round(MAX_FILE_BYTES / 1024)} Ko. ` +
          "Réduisez-le ou déposez une photo du document.",
      );
    }
    dataUrl = await fileToDataUrl(file);
    if (dataUrl.length > MAX_DATAURL_CHARS) {
      throw new FileTooLargeError(
        "Ce fichier est trop lourd une fois encodé. Réduisez sa taille.",
      );
    }
  }

  await addDoc(collection(db, "documents"), {
    ownerId,
    patientId,
    name: label?.trim() || file.name,
    category,
    dataUrl,
    size: Math.round((dataUrl.length * 3) / 4), // taille réelle stockée
    contentType,
    createdAt: serverTimestamp(),
  });
}

// Ouvre un document dans un nouvel onglet.
// Les data URLs ne peuvent pas être ouvertes directement dans un onglet
// (bloquées par les navigateurs) → conversion en Blob + object URL.
export function openDocument(d: PatientDocument): void {
  // Héritage Storage : URL http classique.
  if (!d.dataUrl) {
    if (d.fileUrl) window.open(d.fileUrl, "_blank", "noopener");
    return;
  }

  const [header, base64] = d.dataUrl.split(",");
  const mime =
    header.match(/data:(.*?);/)?.[1] ||
    d.contentType ||
    "application/octet-stream";
  const bytes = atob(base64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([buf], { type: mime }));
  window.open(url, "_blank", "noopener");
  // Libère l'URL après ouverture (l'onglet garde sa propre référence).
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Écoute des documents d'un patient.
export function listenDocuments(
  patientId: string,
  cb: (list: PatientDocument[]) => void,
) {
  const q = query(
    collection(db, "documents"),
    where("patientId", "==", patientId),
  );
  return onSnapshot(q, (snap) => {
    const data: PatientDocument[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PatientDocument, "id">),
    }));
    data.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });
    cb(data);
  });
}

// Supprime un document (le fichier est dans le doc Firestore lui-même).
export async function deleteDocument(d: PatientDocument): Promise<void> {
  await deleteDoc(doc(db, "documents", d.id));
}
