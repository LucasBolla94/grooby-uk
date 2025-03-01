// src/lib/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase (substitua pelos seus valores do Firebase Console)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Verifica se o Firebase já foi inicializado, caso contrário, inicializa
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exporta o app, caso precise usar em outro lugar
export { app };

// Exporta os serviços
export const auth = getAuth(app);           // Autenticação
export const db = getFirestore(app);        // Firestore Database
export const realtimeDB = getDatabase(app); // Realtime Database
export const storage = getStorage(app);     // Storage
