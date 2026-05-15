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

const SESSION_COOKIE = "firebaseSession";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

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
  const expires = new Date();

  // Renouvelle à chaque appel → +3h
  expires.setHours(expires.getHours() + 3);

  document.cookie = `${SESSION_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
};

const removeSessionCookie = () => {
  document.cookie = `${SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FIREBASE AUTH LISTENER
  // ============================================================

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        setSessionCookie();
      } else {
        removeSessionCookie();
      }
    });

    return () => unsub();
  }, []);

  // ============================================================
  // AUTO REFRESH COOKIE
  // Tant que l'utilisateur est connecté,
  // le cookie est renouvelé automatiquement.
  // ============================================================

  useEffect(() => {
    if (!user) return;

    // Renouvelle toutes les 30 minutes
    const interval = setInterval(
      () => {
        setSessionCookie();
      },
      30 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [user]);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setSessionCookie();
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (name: string, email: string, password: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await updateProfile(newUser, {
      displayName: name,
    });

    await setDoc(doc(db, "patients", newUser.uid), {
      uid: newUser.uid,
      name,
      email,
      role: "patient",
      createdAt: serverTimestamp(),
    });

    setSessionCookie();
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    await signOut(auth);
    removeSessionCookie();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
