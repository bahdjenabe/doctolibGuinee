// ============================================================
// SEED DÉMO — crée les comptes et données pour la vidéo
// Patient :  patient.demo@doctolibguinee-demo.com
// Médecin :  docteur.demo@doctolibguinee-demo.com
// Mot de passe (les deux) : DemoDoctolib2026!
// ============================================================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, addDoc, collection, serverTimestamp,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDxH4BiVk9PXvvrFlZRK13wGoMLkCmA6kU",
  authDomain: "doctolibguinee.firebaseapp.com",
  projectId: "doctolibguinee",
  storageBucket: "doctolibguinee.firebasestorage.app",
  messagingSenderId: "234122357962",
  appId: "1:234122357962:web:04e312df99918937825833",
});
const auth = getAuth(app);
const db = getFirestore(app);

const PASS = "DemoDoctolib2026!";
const P_MAIL = "patient.demo@doctolibguinee-demo.com";
const D_MAIL = "docteur.demo@doctolibguinee-demo.com";

const pad = (n) => String(n).padStart(2, "0");
function dateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000`;
}

async function getOrCreate(email, name) {
  try {
    const c = await createUserWithEmailAndPassword(auth, email, PASS);
    await updateProfile(c.user, { displayName: name });
    console.log(`✅ compte créé : ${email} (${c.user.uid})`);
    return c.user;
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      const c = await signInWithEmailAndPassword(auth, email, PASS);
      console.log(`ℹ️ compte existant : ${email} (${c.user.uid})`);
      return c.user;
    }
    throw e;
  }
}

// ── 1. Comptes ──
const doctor = await getOrCreate(D_MAIL, "Dr Aissatou Camara");
const doctorId = doctor.uid;

// ── 2. Fiche médecin (règle temporaire : self-create) ──
await setDoc(doc(db, "doctors", doctorId), {
  name: "Dr Aissatou Camara",
  specialty: "Cardiologue",
  city: "Conakry",
  image: "",
  rating: 4.8,
  reviews: 26,
  phone: "+224 620 00 00 00",
  languages: ["Français", "Soussou", "Peul"],
  experience: 12,
  workingHours: {
    monday: ["08:00-12:00", "14:00-17:00"],
    tuesday: ["08:00-12:00", "14:00-17:00"],
    wednesday: ["08:00-12:00", "14:00-17:00"],
    thursday: ["08:00-12:00", "14:00-17:00"],
    friday: ["08:00-12:00", "14:00-17:00"],
    saturday: ["09:00-13:00"],
  },
});
console.log("✅ fiche médecin créée");
await signOut(auth);

const patient = await getOrCreate(P_MAIL, "Aminata Bah");
const patientId = patient.uid;

// ── 3. Profil patient ──
await setDoc(doc(db, "patients", patientId), {
  name: "Aminata Bah",
  email: P_MAIL,
  phone: "+224 622 11 22 33",
  birthDate: "1994-05-12",
  bloodGroup: "O+",
  createdAt: serverTimestamp(),
}, { merge: true });
await addDoc(collection(db, "patients", patientId, "beneficiaries"), {
  name: "Ibrahima Bah", relation: "Fils", birthDate: "2019-03-08",
  createdAt: serverTimestamp(),
});
console.log("✅ profil patient + bénéficiaire");

// ── 4. Rendez-vous (en tant que patient) ──
const base = {
  doctorId, doctorName: "Dr Aissatou Camara", specialty: "Cardiologue",
  city: "Conakry", patientId, patientName: "Aminata Bah",
  paid: true, paymentMethod: "orange_money", amount: 150000,
  paymentMode: "simulation",
};

// a) Téléconsultation CONFIRMÉE dans ~8 min (fenêtre visio ouverte)
const videoDate = new Date(Date.now() + 8 * 60 * 1000);
videoDate.setSeconds(0, 0);
const apptVideo = await addDoc(collection(db, "appointments"), {
  ...base, date: dateStr(videoDate), type: "video", status: "confirmed",
  paymentRef: "PAY-2026-DEMO01", createdAt: serverTimestamp(),
});
await setDoc(doc(db, "bookedSlots", `${doctorId}_${videoDate.getTime()}`), {
  doctorId, time: videoDate.getTime(), createdAt: serverTimestamp(),
});

// b) RDV cabinet EN ATTENTE dans 3 jours à 09:00
const pend = new Date(Date.now() + 3 * 86400000); pend.setHours(9, 0, 0, 0);
await addDoc(collection(db, "appointments"), {
  ...base, date: dateStr(pend), type: "cabinet", status: "pending",
  paymentRef: "PAY-2026-DEMO02", createdAt: serverTimestamp(),
});
await setDoc(doc(db, "bookedSlots", `${doctorId}_${pend.getTime()}`), {
  doctorId, time: pend.getTime(), createdAt: serverTimestamp(),
});

// c) RDV passé CONFIRMÉ (il y a 8 jours, 10:00) → pour l'avis + ordonnance
const past = new Date(Date.now() - 8 * 86400000); past.setHours(10, 0, 0, 0);
const apptPast = await addDoc(collection(db, "appointments"), {
  ...base, date: dateStr(past), type: "cabinet", status: "confirmed",
  paymentRef: "PAY-2026-DEMO03", createdAt: serverTimestamp(),
});
console.log("✅ 3 rendez-vous (vidéo confirmé, cabinet en attente, passé)");

// ── 5. Avis 5 étoiles sur le RDV passé ──
await addDoc(collection(db, "reviews"), {
  doctorId, patientId, patientName: "Aminata Bah",
  appointmentId: apptPast.id, rating: 5,
  comment: "Très bonne écoute, explications claires. Je recommande vivement !",
  createdAt: serverTimestamp(),
});
console.log("✅ avis publié");

// ── 6. Document déposé (petite image base64) ──
const px = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNsaGj4DwAFhAKAtG9tKgAAAABJRU5ErkJggg==";
await addDoc(collection(db, "documents"), {
  ownerId: patientId, patientId, name: "Bilan sanguin — juin 2026",
  category: "Analyse", dataUrl: "data:image/png;base64," + px,
  size: 68, contentType: "image/png", createdAt: serverTimestamp(),
});
console.log("✅ document déposé");

// ── 7. Conversation : message du patient ──
const convId = `${patientId}__${doctorId}`;
await setDoc(doc(db, "conversations", convId), {
  participants: [patientId, doctorId], patientId, doctorId,
  patientName: "Aminata Bah", doctorName: "Dr Aissatou Camara",
  specialty: "Cardiologue", lastMessage: "", lastSenderId: "",
  unread: { [patientId]: 0, [doctorId]: 0 }, updatedAt: serverTimestamp(),
});
await addDoc(collection(db, "conversations", convId, "messages"), {
  senderId: patientId, senderName: "Aminata Bah",
  text: "Bonjour docteur, j'ai bien commencé le traitement ce matin 🙏",
  createdAt: serverTimestamp(),
});
await setDoc(doc(db, "conversations", convId), {
  lastMessage: "Bonjour docteur, j'ai bien commencé le traitement ce matin 🙏",
  lastSenderId: patientId, updatedAt: serverTimestamp(),
}, { merge: true });
console.log("✅ conversation + message patient");
await signOut(auth);

// ── 8. Côté médecin : réponse + ordonnance ──
await signInWithEmailAndPassword(auth, D_MAIL, PASS);
await addDoc(collection(db, "conversations", convId, "messages"), {
  senderId: doctorId, senderName: "Dr Aissatou Camara",
  text: "Parfait Aminata. Pensez à mesurer votre tension chaque matin et notez les valeurs.",
  createdAt: serverTimestamp(),
});
await setDoc(doc(db, "conversations", convId), {
  lastMessage: "Parfait Aminata. Pensez à mesurer votre tension chaque matin.",
  lastSenderId: doctorId, updatedAt: serverTimestamp(),
}, { merge: true });

const presc = await addDoc(collection(db, "prescriptions"), {
  doctorId, doctorName: "Dr Aissatou Camara", specialty: "Cardiologue",
  patientId, patientName: "Aminata Bah", appointmentId: apptPast.id,
  date: new Date().toISOString(),
  medications: [
    { name: "Amlodipine 5 mg", dosage: "1 comprimé le matin", duration: "30 jours", instructions: "" },
    { name: "Aspirine 100 mg", dosage: "1 comprimé au dîner", duration: "30 jours", instructions: "Après le repas" },
  ],
  notes: "Contrôle de la tension dans 2 semaines. Éviter le sel.",
  createdAt: serverTimestamp(),
});

// Notification côté médecin (demande en attente)
await addDoc(collection(db, "notifications"), {
  recipientId: doctorId, type: "new_request",
  title: "Nouvelle demande de rendez-vous",
  message: "Aminata Bah demande un rendez-vous.",
  read: false, createdAt: serverTimestamp(),
});
console.log("✅ réponse médecin + ordonnance + notification");

console.log("\n=== RÉCAP ===");
console.log("PATIENT_UID=" + patientId);
console.log("DOCTOR_UID=" + doctorId);
console.log("APPT_VIDEO=" + apptVideo.id);
console.log("PRESCRIPTION=" + presc.id);
process.exit(0);
