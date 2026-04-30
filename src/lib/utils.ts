import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `منذ ${days} أيام`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

export function handleFirestoreError(error: any) {
  const errorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType: 'write', // Default, can be refined per call
    path: null,
    authInfo: {
      userId: 'anonymous',
      email: 'none',
      emailVerified: false,
      isAnonymous: true,
      providerInfo: []
    }
  };
  return JSON.stringify(errorInfo);
}
