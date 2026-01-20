import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import type { FormValues } from '../components/form/types';
import { db, isFirebaseConfigured, storage } from './firebase';

const FILE_FIELDS: Array<keyof FormValues> = [
  'documentFront',
  'documentBack',
  'selfie',
  'proofOfAddress',
  'articlesOfAssociation',
  'cnpjCard',
  'adminIdFront',
  'adminIdBack',
  'companyProofOfAddress',
  'ecnpjCertificate',
];

const collectionName = 'registrations';

const sanitizeFileName = (name: string) => name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9._-]/g, '');

const buildPayload = (values: FormValues) => {
  const payload: Record<string, unknown> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (FILE_FIELDS.includes(key as keyof FormValues)) {
      return;
    }
    if (typeof value === 'boolean') {
      payload[key] = value;
      return;
    }
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return;
    }
    payload[key] = value;
  });

  return payload;
};

const uploadDocuments = async (submissionId: string, values: FormValues) => {
  if (!storage) return {};

  const uploads: Record<string, { name: string; type: string; size: number; url: string; path: string }> = {};

  for (const field of FILE_FIELDS) {
    const file = values[field];
    if (!(file instanceof File)) continue;

    const fileName = sanitizeFileName(file.name) || `${field}-${Date.now()}`;
    const path = `registrations/${submissionId}/${field}-${Date.now()}-${fileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    uploads[field] = {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      path,
    };
  }

  return uploads;
};

export const submitRegistration = async (values: FormValues) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('firebase-not-configured');
  }

  const payload = buildPayload(values);
  const docRef = await addDoc(collection(db, collectionName), {
    ...payload,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  const documents = await uploadDocuments(docRef.id, values);

  if (Object.keys(documents).length > 0) {
    await updateDoc(doc(db, collectionName, docRef.id), {
      documents,
      updatedAt: serverTimestamp(),
    });
  }

  return docRef.id;
};
