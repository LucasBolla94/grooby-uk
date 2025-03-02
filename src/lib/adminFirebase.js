import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';
import fs from 'fs';

// 🔹 Verifica se o Firebase Admin já foi inicializado para evitar múltiplas inicializações
if (!getApps().length) {
  console.log('🔹 Inicializando Firebase Admin...');
  
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    console.error('⛔ ERRO: Arquivo de credenciais do Firebase não encontrado!');
    throw new Error('Firebase Admin credentials file is missing.');
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage().bucket();
