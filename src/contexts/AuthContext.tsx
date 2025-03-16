import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function getUserData(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || userDoc.data().displayName || '',
          role: userDoc.data().role as UserRole
        };
      } else {
        // If user document doesn't exist in Firestore, create a basic one
        // This is a fallback for cases where auth exists but Firestore data doesn't
        console.log('User document missing in Firestore. Creating basic profile...');
        try {
          const basicUserData = {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: UserRole.Student, // Default role
            createdAt: new Date()
          };
          
          // Create the user document
          await setDoc(userDocRef, basicUserData);
        } catch (firestoreError) {
          console.warn('Cannot create Firestore profile due to permission issue:', firestoreError);
          console.warn('This is expected if you haven\'t updated Firestore security rules.');
        }
        
        // Return a user object even if Firestore writing failed
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: UserRole.Student
        };
      }
    } catch (error) {
      console.error('Error fetching/creating user data:', error);
      
      // If it's a permission error, return a user object anyway
      // This allows the app to function even with Firestore permission issues
      console.log('Using fallback user data due to Firestore access issue');
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        role: UserRole.Student // Default to Student role
      };
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await getUserData(firebaseUser);
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserData(userCredential.user);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function register(email: string, password: string, name: string, role: UserRole) {
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      try {
        // Try to create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          displayName: name,
          role,
          createdAt: new Date()
        });
      } catch (firestoreError) {
        // If Firestore permission error, log it but continue
        console.warn('Firestore permission error. User created in Auth but not in Firestore:', firestoreError);
        console.warn('Please update your Firestore security rules in the Firebase Console.');
        
        // Show instructions in the console for updating security rules
        console.info(`
To fix this error, go to Firebase Console → Firestore Database → Rules and update with:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

This will temporarily allow all authenticated users to read/write. For production, use more restrictive rules.
        `);
      }
      
      // Set the user in state even if Firestore failed
      const userData: User = {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        role
      };
      
      setCurrentUser(userData);
      
      // Return success to the UI
      return;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  const value = {
    currentUser,
    userRole: currentUser?.role || null,
    loading,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 