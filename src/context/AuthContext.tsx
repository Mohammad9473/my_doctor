"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUser,
  setUserTypeClaim,
  onAuthStateChanged,
} from "@/lib/firebase";

interface AuthContextType {
  user: any | null;
  userType: "doctor" | "patient" | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, isDoctor: boolean) => Promise<any>;
  googleSignUp: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const defaultAuthContext: AuthContextType = {
  userType: null,
  user: null,
  login: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  googleSignUp: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const token = await authUser.getIdTokenResult();
        const userTypeClaim = token.claims.userType;
        if (userTypeClaim) {
          if (userTypeClaim === "doctor" || userTypeClaim === "patient") {
            setUserType(userTypeClaim);
          }
        } else {
          setUserType(null);
        }
        setUser({ ...authUser, userType: token.claims.userType });
      } else {
        setUser(null);
      }
      setUser(authUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, isDoctor: boolean) => {
    setIsLoading(true);
    setError(null);
    let uid;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      uid = userCredential.user.uid;
      await Promise.all([
        createUser(uid, isDoctor),
        setUserTypeClaim(uid, isDoctor),
      ]);
      return userCredential;
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignUp = async () => {
    alert("Coming Soon :D");
    return;
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userType,
    login,
    signUp,
    googleSignUp,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
