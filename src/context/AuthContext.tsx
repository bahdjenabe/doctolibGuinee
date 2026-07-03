"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ============================================================
// CONFIG
// ============================================================

const SESSION_COOKIE = "firebaseSession";
// Durée de validité d'une session avant déconnexion automatique.
// 24h : confortable pour une appli grand public, évite les déconnexions
// en pleine prise de rendez-vous. Ajustable ici au besoin.
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures en ms

// ============================================================
// TYPES
// ============================================================

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// ============================================================
// COOKIE HELPERS
// ============================================================

const setSessionCookie = () => {
  const expires = new Date(Date.now() + SESSION_DURATION);
  document.cookie = `${SESSION_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
};

const removeSessionCookie = () => {
  document.cookie = `${SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ============================================================
// SESSION EXPIRY HELPERS
// ============================================================

const setSessionExpiry = () => {
  // Stocke le timestamp d'expiration dans localStorage
  const expiry = Date.now() + SESSION_DURATION;
  localStorage.setItem("sessionExpiry", expiry.toString());
};

const getSessionExpiry = (): number | null => {
  const val = localStorage.getItem("sessionExpiry");
  return val ? Number(val) : null;
};

const clearSessionExpiry = () => {
  localStorage.removeItem("sessionExpiry");
};

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FIREBASE AUTH LISTENER
  //
  // FIX PRINCIPAL :
  // Quand Firebase reconnecte automatiquement l'utilisateur
  // (rechargement de page), on vérifie si sessionExpiry existe.
  //
  //   - Si oui ET non expiré → on renouvelle le cookie
  //   - Si oui ET expiré     → on déconnecte immédiatement
  //   - Si non               → première connexion, on définit l'expiry
  // ============================================================

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const expiry = getSessionExpiry();

        if (expiry === null) {
          // Première connexion sur cet appareil → on initialise l'expiry
          setSessionExpiry();
          setSessionCookie();
          setUser(firebaseUser);
        } else if (Date.now() > expiry) {
          // Session expirée → déconnexion immédiate
          // (Firebase a reconnecté automatiquement mais la session est périmée)
          await signOut(auth);
          removeSessionCookie();
          clearSessionExpiry();
          setUser(null);
          window.location.href = "/login";
        } else {
          // Session encore valide → on renouvelle cookie et expiry
          setSessionCookie();
          setSessionExpiry();
          setUser(firebaseUser);
        }
      } else {
        // Utilisateur déconnecté
        removeSessionCookie();
        clearSessionExpiry();
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ============================================================
  // AUTO LOGOUT À L'EXPIRATION DE LA SESSION (SESSION_DURATION)
  //
  // Vérifie périodiquement si la session a expiré → déconnexion
  // automatique. On vérifie toutes les 60 secondes : un délai de
  // détection d'1 min est largement suffisant et reste léger.
  // ============================================================

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const expiry = getSessionExpiry();

      // Pas d'expiry défini → ne rien faire
      if (!expiry) return;

      const isExpired = Date.now() > expiry;

      if (isExpired) {
        console.log("[Auth] Session expirée → déconnexion automatique");

        // Déconnexion Firebase
        await signOut(auth);

        // Nettoyage
        removeSessionCookie();
        clearSessionExpiry();

        // Redirection vers login
        window.location.href = "/login";
      }
    }, 60 * 1000); // vérification toutes les 60 secondes

    return () => clearInterval(interval);
  }, [user]);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);

    // Définit l'expiry ET le cookie au moment de la connexion
    setSessionExpiry();
    setSessionCookie();
  };

  // ============================================================
  // REGISTER
  // ============================================================

  // const register = async (name: string, email: string, password: string) => {
  //   const { user: newUser } = await createUserWithEmailAndPassword(
  //     auth,
  //     email,
  //     password,
  //   );

  //   await updateProfile(newUser, { displayName: name });

  //   await setDoc(doc(db, "patients", newUser.uid), {
  //     uid: newUser.uid,
  //     name,
  //     email,
  //     role: "patient",
  //     createdAt: serverTimestamp(),
  //   });

  //   // Définit l'expiry ET le cookie à l'inscription
  //   setSessionExpiry();
  //   setSessionCookie();
  // };

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (name: string, email: string, password: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Met à jour le profil Firebase
    await updateProfile(newUser, {
      displayName: name,
    });

    // Sauvegarde Firestore
    await setDoc(doc(db, "patients", newUser.uid), {
      uid: newUser.uid,
      name,
      email,
      role: "patient",
      createdAt: serverTimestamp(),
    });

    // Firebase connecte automatiquement après l'inscription.
    // On garde l'utilisateur connecté pour un parcours fluide
    // (ex: revenir directement sur son créneau de rendez-vous).
    setSessionExpiry();
    setSessionCookie();
  };

  // ============================================================
  // LOGOUT (manuel)
  // ============================================================

  const logout = async () => {
    await signOut(auth);
    removeSessionCookie();
    clearSessionExpiry();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export const useAuth = () => useContext(AuthContext);
