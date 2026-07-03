// ============================================================
// SCRIPT DE MAINTENANCE — scripts/backfill-bookedslots.mjs
// ============================================================
//
// 1. BACKFILL : crée un doc bookedSlots/{doctorId}_{ms} pour chaque
//    rendez-vous existant non annulé (nécessaire une seule fois,
//    lors de la migration vers la collection publique bookedSlots).
// 2. SMOKE TEST : vérifie les règles de sécurité en production avec
//    un compte jetable (inscription → lectures/écritures → nettoyage).
//
// Usage :  node scripts/backfill-bookedslots.mjs
// ============================================================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxH4BiVk9PXvvrFlZRK13wGoMLkCmA6kU",
  authDomain: "doctolibguinee.firebaseapp.com",
  projectId: "doctolibguinee",
  storageBucket: "doctolibguinee.firebasestorage.app",
  messagingSenderId: "234122357962",
  appId: "1:234122357962:web:04e312df99918937825833",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Même logique que src/lib/slots.ts → normalizeTime
function normalizeTime(date) {
  if (!date) return null;
  if (typeof date?.toDate === "function") return date.toDate().getTime();
  if (typeof date === "string") {
    const local = date.endsWith("Z") ? date.slice(0, -1) : date;
    const ms = new Date(local).getTime();
    return isNaN(ms) ? null : ms;
  }
  if (typeof date === "number") return date;
  return null;
}

let failures = 0;
const ok = (label) => console.log(`  ✅ ${label}`);
const ko = (label, e) => {
  failures++;
  console.error(`  ❌ ${label} — ${e?.code || ""} ${e?.message || e}`);
};

async function main() {
  // ── Compte jetable ──
  const email = `smoke.test.${Date.now()}@example.com`;
  const password = `Test-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  console.log(`\n1) Inscription du compte de test ${email}`);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  ok(`Compte créé (uid ${uid})`);

  // ── BACKFILL bookedSlots ──
  console.log("\n2) Backfill des créneaux depuis les RDV existants");
  try {
    const snap = await getDocs(collection(db, "appointments"));
    let created = 0,
      skipped = 0;
    for (const d of snap.docs) {
      const a = d.data();
      if (a.status === "cancelled") continue;
      const ms = normalizeTime(a.date);
      if (!a.doctorId || ms === null) continue;
      try {
        await setDoc(doc(db, "bookedSlots", `${a.doctorId}_${ms}`), {
          doctorId: a.doctorId,
          time: ms,
          createdAt: serverTimestamp(),
        });
        created++;
      } catch (e) {
        if (e?.code === "permission-denied") skipped++; // déjà présent
        else throw e;
      }
    }
    ok(`${snap.size} RDV lus → ${created} créneaux créés, ${skipped} déjà présents`);
  } catch (e) {
    ko("Backfill", e);
  }

  // ── SMOKE TESTS ──
  console.log("\n3) Tests des règles de sécurité");

  // Lecture publique des médecins
  try {
    const snap = await getDocs(collection(db, "doctors"));
    ok(`Lecture des médecins (${snap.size} docs)`);
  } catch (e) {
    ko("Lecture des médecins", e);
  }

  // Profil patient : création + lecture de SA fiche
  try {
    await setDoc(doc(db, "patients", uid), {
      name: "COMPTE TEST AUTOMATIQUE — à ignorer",
      email,
      createdAt: serverTimestamp(),
    });
    const snap = await getDoc(doc(db, "patients", uid));
    if (!snap.exists()) throw new Error("relecture vide");
    ok("Profil patient : écriture + lecture");
  } catch (e) {
    ko("Profil patient", e);
  }

  // Documents : création base64 + lecture + suppression
  try {
    const ref = await addDoc(collection(db, "documents"), {
      ownerId: uid,
      patientId: uid,
      name: "test.txt",
      category: "Autre",
      dataUrl: "data:text/plain;base64,VGVzdA==",
      size: 4,
      contentType: "text/plain",
      createdAt: serverTimestamp(),
    });
    const q = query(collection(db, "documents"), where("patientId", "==", uid));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("document non relu");
    await deleteDoc(ref);
    ok("Documents : création + lecture + suppression");
  } catch (e) {
    ko("Documents", e);
  }

  // bookedSlots : réservation atomique
  const fakeDoctor = "smoke-test-doctor";
  const slotMs = Date.now() + 86400000;
  const slotRef = doc(db, "bookedSlots", `${fakeDoctor}_${slotMs}`);
  try {
    await setDoc(slotRef, {
      doctorId: fakeDoctor,
      time: slotMs,
      createdAt: serverTimestamp(),
    });
    ok("bookedSlots : réservation d'un créneau");
    // La 2e réservation du même créneau doit être REFUSÉE
    try {
      await setDoc(slotRef, {
        doctorId: fakeDoctor,
        time: slotMs,
        createdAt: serverTimestamp(),
      });
      ko("bookedSlots : la double réservation aurait dû être refusée");
    } catch (e) {
      if (e?.code === "permission-denied")
        ok("bookedSlots : double réservation bien refusée (atomicité)");
      else ko("bookedSlots : double réservation", e);
    }
    await deleteDoc(slotRef);
    ok("bookedSlots : libération du créneau");
  } catch (e) {
    ko("bookedSlots : réservation", e);
  }

  // Conversation : getDoc inexistant puis création (bug corrigé aujourd'hui)
  try {
    const convId = `${uid}__smoke-test-doctor`;
    const convRef = doc(db, "conversations", convId);
    const snap = await getDoc(convRef); // doit passer même si inexistant
    if (snap.exists()) throw new Error("conversation déjà existante ?");
    ok("Conversations : lecture d'un doc inexistant autorisée");
  } catch (e) {
    ko("Conversations : lecture doc inexistant", e);
  }

  // ── Nettoyage ──
  console.log("\n4) Nettoyage");
  try {
    await deleteDoc(doc(db, "patients", uid)).then(
      () => ko("La suppression du profil patient devrait être refusée"),
      () => ok("Suppression du profil patient bien refusée par les règles"),
    );
    await deleteUser(cred.user);
    ok("Compte de test supprimé de Firebase Auth");
  } catch (e) {
    ko("Nettoyage", e);
  }

  console.log(
    failures === 0
      ? "\n🎉 Tous les tests sont passés."
      : `\n⚠️ ${failures} test(s) en échec.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Erreur fatale :", e);
  process.exit(1);
});
