import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

import type { FormValues } from '../components/form/types';
import { db, isFirebaseConfigured } from './firebase';

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

const getLeadFields = (values: RegistrationInput) => {
  const isCompany = values.accountType === 'PJ';
  const name = isCompany ? values.companyName : values.fullName;
  const email = isCompany ? values.companyEmail : values.userEmail;
  const phone = isCompany ? values.companyPhone : values.userPhone;
  const cpf = isCompany ? undefined : values.cpf;

  return {
    name,
    email,
    phone,
    cpf,
  };
};

export const submitForm = async (values: RegistrationInput) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('firebase-not-configured');
  }

  const payload = buildPayload(values);
  const lead = getLeadFields(values);
  const docRef = await addDoc(collection(db, collectionName), {
    ...payload,
    ...lead,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const uploadFile = async (docId: string, file: File) => {
  const storage = getStorage();
  const safeName = sanitizeFileName(file.name) || 'file';
  const path = `registrations/${docId}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

export const uploadRegistrationDocuments = async (submissionId: string, values: RegistrationInput) => {
  const uploads: Record<string, string> = {};

  for (const field of FILE_FIELDS) {
    const file = values[field];
    if (!(file instanceof File)) continue;
    uploads[field] = await uploadFile(submissionId, file);
  }

  return uploads;
};

export const submitRegistration = async (values: RegistrationInput) => {
  const docId = await submitForm(values);
  await uploadRegistrationDocuments(docId, values);
  return docId;
};
