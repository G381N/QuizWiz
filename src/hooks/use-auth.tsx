'use client';

import * as React from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // This is a new user, create their document
          await setDoc(userDocRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            totalScore: 0,
            quizzesSolved: 0,
            perks: {
                'fifty-fifty': 1,
                'score-booster': 0,
                'skip-question': 1,
                'time-attack': 0,
            },
          });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user document creation and routing
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const value = { user, loading, signIn, signOut: logOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
