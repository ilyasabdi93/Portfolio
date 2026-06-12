import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export interface Profile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  title?: string;
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

async function ensureProfile(user: User): Promise<Profile> {
  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: Profile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      bio: "",
      title: "",
    };
    await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
    return profile;
  }
  return { uid: user.uid, ...snap.data() } as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await ensureProfile(u);
          setProfile(p);
        } catch (e) {
          console.error("profile load failed", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value: AuthCtx = {
    user,
    profile,
    loading,
    signInEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signUpEmail: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await ensureProfile(cred.user);
    },
    signInGoogle: async () => {
      await signInWithPopup(auth, googleProvider);
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },
    logout: async () => {
      await signOut(auth);
    },
    updateProfileData: async (data) => {
      if (!user) return;
      const ref = doc(db, "profiles", user.uid);
      await setDoc(ref, { ...(profile ?? { uid: user.uid }), ...data }, { merge: true });
      setProfile((prev) => ({ ...(prev ?? ({ uid: user.uid } as Profile)), ...data }));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
