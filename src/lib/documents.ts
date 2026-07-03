// ============================================================
// HELPERS DOCUMENTS & ORDONNANCES — src/lib/documents.ts
// ============================================================
//
// Ordonnances (collection "prescriptions") : structurées, rédigées
// par le médecin, consultées + imprimées par le patient. Immuables.
//
// Documents (collection "documents" + Firebase Storage) : fichiers
// déposés par le patient (analyses, imagerie…). Métadonnées en
// Firestore, fichier binaire dans Storage sous documents/{uid}/…
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
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

// Dépose un fichier : upload Storage + métadonnées Firestore.
export async function uploadDocument(params: {
  ownerId: string;
  patientId: string;
  file: File;
  category: DocumentCategory;
  label?: string;
}): Promise<void> {
  const { ownerId, patientId, file, category, label } = params;

  // Chemin unique sous le dossier de l'utilisateur.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `documents/${ownerId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const fileUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "documents"), {
    ownerId,
    patientId,
    name: label?.trim() || file.name,
    category,
    fileUrl,
    storagePath,
    size: file.size,
    contentType: file.type,
    createdAt: serverTimestamp(),
  });
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

// Supprime un document (fichier Storage + métadonnées).
export async function deleteDocument(d: PatientDocument): Promise<void> {
  try {
    await deleteObject(ref(storage, d.storagePath));
  } catch (e) {
    // Le fichier peut déjà avoir disparu — on continue quand même.
    console.warn("[documents] Suppression Storage:", e);
  }
  await deleteDoc(doc(db, "documents", d.id));
}
