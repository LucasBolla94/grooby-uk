import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Caminho absoluto para o arquivo de credenciais JSON
const keyFilePath = path.resolve(process.cwd(), 'src/lib/firebaseAdminKey.json');

let serviceAccount = null;

// Lendo o arquivo JSON e convertendo para objeto
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
  console.log('✅ Firebase Admin Key carregada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao carregar Firebase Admin Key:', error);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: serviceAccount.databaseURL || process.env.FIREBASE_ADMIN_DATABASE_URL, // Usa o valor do JSON, mas fallback para env se necessário
      // Definindo o storageBucket com uma variável de ambiente ou um valor padrão
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'grooby-co.firebasestorage.app',
    });

    console.log('🔥 Firebase Admin inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error);
  }
}

// Exportando serviços do Firebase Admin
export const adminAuth = admin.auth();
export const adminDB = admin.firestore();

// Exporta o bucket do Firebase Storage para uso no upload de imagens
export const adminStorage = admin.storage().bucket();
