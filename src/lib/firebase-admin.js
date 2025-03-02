import admin from 'firebase-admin';

// Evita inicialização duplicada
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_ADMIN_TYPE,
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL,
  });
}

export const adminAuth = admin.auth();      // Autenticação via Firebase Admin
export const adminDB = admin.firestore();   // Firestore no backend
export const adminStorage = admin.storage(); // Storage no backend
export const adminRealtimeDB = admin.database(); // Realtime Database no backend
