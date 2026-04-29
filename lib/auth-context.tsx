"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
  signOut,
} from "@/lib/firebase";
import type { AppUser } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
});

function readSsoSession(): AppUser | null {
  if (typeof document === "undefined") return null;
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("canal_session="))
      ?.split("=")[1];
    if (!raw) return null;
    const data = JSON.parse(atob(raw)) as {
      uid: string; nombre: string; role: string; exp: number;
    };
    if (Date.now() > data.exp) return null;
    return {
      id: data.uid,
      name: data.nombre,
      cedula: data.uid,
      area: "cultura",
      role: data.role as AppUser["role"],
      createdBy: "sso",
      createdAt: Timestamp.now(),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as AppUser);
        } else {
          setUser(null);
        }
      } else {
        // fallback: check SSO session cookie
        const ssoUser = readSsoSession();
        setUser(ssoUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    // clear SSO cookie
    document.cookie = "canal_session=; path=/; max-age=0";
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
