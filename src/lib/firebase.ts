import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.code === 'permission-denied') return;
  }
}
testConnection();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'citizen' | 'official' | 'partner'>('citizen');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const profileSnap = await getDoc(doc(db, 'users', u.uid));
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setProfile(data);
            setRole(data.role || 'citizen');
          } else {
            // Default for anonymous or new users
            setRole('citizen');
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setRole('citizen');
        }
      } else {
        setRole('citizen');
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading, role, profile };
}

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

export function handleFirestoreError(error: any, op: FirestoreErrorInfo['operationType'], path: string | null) {
  if (error.code === 'permission-denied') {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType: op,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid || 'anonymous',
        email: auth.currentUser?.email || '',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || true,
        providerInfo: auth.currentUser?.providerData || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
