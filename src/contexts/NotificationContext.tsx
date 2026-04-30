import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

export interface NotificationPreference {
  infrastructure: boolean;
  weather: boolean;
  campaigns: boolean;
  regionOnly: boolean;
  smsAlerts: boolean;
  ussdInteractive: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'infrastructure' | 'weather' | 'campaign' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  read: boolean;
  regionId?: string;
}

interface NotificationContextType {
  preferences: NotificationPreference;
  notifications: AppNotification[];
  alerts: AppNotification[];
  unreadCount: number;
  updatePreferences: (prefs: Partial<NotificationPreference>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const defaultPreferences: NotificationPreference = {
  infrastructure: true,
  weather: true,
  campaigns: true,
  regionOnly: false,
  smsAlerts: true,
  ussdInteractive: false,
};

const MOCK_ALERTS: AppNotification[] = [
  {
    id: 'a1',
    title: 'تحذير أمطار غزيرة',
    message: 'من المتوقع هطول أمطار غزيرة على ولاية الخرطوم والجزيرة خلال الـ ٢٤ ساعة القادمة. يرجى توخي الحيطة.',
    type: 'weather',
    severity: 'high',
    timestamp: Date.now() - 3600000,
    read: false,
  },
  {
    id: 'a2',
    title: 'صيانة طارئة للكهرباء',
    message: 'ستقوم هيئة الكهرباء بأعمال صيانة في منطقة الرياض، الخرطوم. سيتم قطع التيار من الساعة ١٠ ص وحتى ٢ ظ.',
    type: 'infrastructure',
    severity: 'medium',
    timestamp: Date.now() - 7200000,
    read: false,
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<NotificationPreference>(defaultPreferences);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [alerts, setAlerts] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load preferences
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchPrefs = async () => {
      const docRef = doc(db, 'userPreferences', auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPreferences(docSnap.data() as NotificationPreference);
      } else {
        await setDoc(docRef, defaultPreferences);
      }
    };

    fetchPrefs();
  }, [auth.currentUser]);

  // Sync notifications & real-time alerts
  useEffect(() => {
    if (!auth.currentUser) {
      setNotifications([]);
      setAlerts([]);
      setUnreadCount(0);
      return;
    }

    // Scoped to the user as requested
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppNotification[];
      setNotifications(fetched);
      
      // Also filter for "alerts" (high/critical severity or system types) to display in the dedicated alerts UI
      const newAlerts = fetched.filter(n => n.severity === 'high' || n.severity === 'critical' || n.type === 'system');
      setAlerts(newAlerts);
      
      setUnreadCount(fetched.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const updatePreferences = async (newPrefs: Partial<NotificationPreference>) => {
    if (!auth.currentUser) return;
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await setDoc(doc(db, 'userPreferences', auth.currentUser.uid), updated, { merge: true });
  };

  const markAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    await setDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', id), { read: true }, { merge: true });
  };

  const markAllAsRead = async () => {
    // Mark alerts as read locally for demo
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);

    if (!auth.currentUser) return;
    // Batch update would be better here
    const promises = notifications
      .filter(n => !n.read)
      .map(n => setDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', n.id), { read: true }, { merge: true }));
    await Promise.all(promises);
  };

  return (
    <NotificationContext.Provider value={{
      preferences,
      notifications,
      alerts,
      unreadCount,
      updatePreferences,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
