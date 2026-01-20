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

export type RegistrationInput = FormValues;

const buildPayload = (values: RegistrationInput) => {
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

export const createRegistration = async (values: RegistrationInput) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('firebase-not-configured');
  }

  const payload = buildPayload(values);
  const docRef = await addDoc(collection(db, collectionName), {
    ...payload,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const uploadRegistrationFile = async (
  submissionId: string,
  field: keyof FormValues,
  file: File,
) => {
  if (!storage) {
    throw new Error('storage-not-configured');
  }

  const fileName = sanitizeFileName(file.name) || `${String(field)}-${Date.now()}`;
  const path = `registrations/${submissionId}/${String(field)}-${Date.now()}-${fileName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    url,
    path,
  };
};

export const uploadRegistrationDocuments = async (submissionId: string, values: RegistrationInput) => {
  if (!storage) return {};

  const uploads: Record<string, { name: string; type: string; size: number; url: string; path: string }> = {};

  for (const field of FILE_FIELDS) {
    const file = values[field];
    if (!(file instanceof File)) continue;
    uploads[field] = await uploadRegistrationFile(submissionId, field, file);
  }

  if (Object.keys(uploads).length > 0 && db) {
    await updateDoc(doc(db, collectionName, submissionId), {
      documents: uploads,
      updatedAt: serverTimestamp(),
    });
  }

  return uploads;
};

export const submitRegistration = async (values: RegistrationInput) => {
  const docId = await createRegistration(values);
  await uploadRegistrationDocuments(docId, values);
  return docId;
};
