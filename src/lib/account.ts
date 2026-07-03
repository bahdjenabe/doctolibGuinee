// ============================================================
// HELPERS COMPTE PATIENT — src/lib/account.ts
// ============================================================
//
// Profil stocké dans patients/{uid}. Les proches (bénéficiaires)
// dans la sous-collection patients/{uid}/beneficiaries.
// Le changement de mot de passe passe par une ré-authentification
// (exigence Firebase pour les opérations sensibles).
// ============================================================

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { PatientProfile, Beneficiary } from "@/types/patient";

// ── Lit le profil du patient (crée un squelette si absent) ──
export async function getPatientProfile(
  user: User,
): Promise<PatientProfile> {
  const ref = doc(db, "patients", user.uid);
  const snap = await getDoc(ref);
  const base: PatientProfile = {
    uid: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    city: "",
    preferences: { emailReminders: true, smsReminders: false },
  };
  if (!snap.exists()) return base;
  return { ...base, ...(snap.data() as Partial<PatientProfile>), uid: user.uid };
}

// ── Enregistre le profil (Firestore + displayName Auth) ──
export async function savePatientProfile(
  user: User,
  profile: Partial<PatientProfile>,
): Promise<void> {
  await setDoc(
    doc(db, "patients", user.uid),
    { ...profile, uid: user.uid, updatedAt: serverTimestamp() },
    { merge: true },
  );
  if (profile.name && profile.name !== user.displayName) {
    await updateProfile(user, { displayName: profile.name });
  }
}

// ── Change le mot de passe après ré-authentification ──
export async function changePassword(
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!user.email) throw new Error("NO_EMAIL");
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

// ════════════════════════════════════════════════════════
// PROCHES / BÉNÉFICIAIRES
// ════════════════════════════════════════════════════════

export function listenBeneficiaries(
  uid: string,
  cb: (list: Beneficiary[]) => void,
) {
  const col = collection(db, "patients", uid, "beneficiaries");
  return onSnapshot(col, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Beneficiary, "id">),
      })),
    );
  });
}

export async function addBeneficiary(
  uid: string,
  b: Omit<Beneficiary, "id">,
): Promise<void> {
  await addDoc(collection(db, "patients", uid, "beneficiaries"), {
    ...b,
    createdAt: serverTimestamp(),
  });
}

export async function removeBeneficiary(
  uid: string,
  beneficiaryId: string,
): Promise<void> {
  await deleteDoc(doc(db, "patients", uid, "beneficiaries", beneficiaryId));
}
