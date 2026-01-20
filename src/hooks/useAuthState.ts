import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth, isFirebaseConfigured } from '../lib/firebase';

type AuthStatus = 'loading' | 'ready' | 'disabled';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setStatus('disabled');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setStatus('ready');
    });

    return () => unsubscribe();
  }, []);

  return { user, status, isFirebaseConfigured };
}
