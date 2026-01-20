import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, type DocumentData } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../lib/firebase';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | string;

export interface RegistrationRecord {
  id: string;
  accountType?: string;
  fullName?: string;
  companyName?: string;
  cpf?: string;
  cnpj?: string;
  userEmail?: string;
  companyEmail?: string;
  status?: RegistrationStatus;
  createdAt?: Date | null;
}

type LoadStatus = 'loading' | 'idle' | 'error' | 'disabled';

const mapSnapshot = (data: DocumentData): RegistrationRecord => {
  const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate() : null;

  return {
    id: data.id,
    accountType: data.accountType,
    fullName: data.fullName,
    companyName: data.companyName,
    cpf: data.cpf,
    cnpj: data.cnpj,
    userEmail: data.userEmail,
    companyEmail: data.companyEmail,
    status: data.status,
    createdAt,
  };
};

export function useRegistrations(limitCount = 20) {
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setStatus('disabled');
      return;
    }

    setStatus('loading');
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'), limit(limitCount));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => mapSnapshot({ id: docSnap.id, ...docSnap.data() }));
        setRecords(next);
        setStatus('idle');
      },
      () => {
        setStatus('error');
      },
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { records, status };
}
