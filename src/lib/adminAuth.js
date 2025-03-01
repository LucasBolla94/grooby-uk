import admin from 'firebase-admin';
import serviceAccount from './firebaseAdminKey.json';

// Inicializa o Firebase Admin apenas se ainda não estiver inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'cityswapuk.appspot.com', // Verifique se este é o nome correto do seu bucket
  });
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage().bucket(); // Exporta o bucket diretamente
