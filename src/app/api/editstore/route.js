import { NextResponse } from 'next/server';
import { adminAuth, adminDB } from '@/lib/firebase-admin'; // Firebase Admin para operações seguras no backend
import { db } from '@/lib/firebase'; // Firebase Client SDK para acesso ao Firestore no frontend
import { doc, getDoc, updateDoc } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    // 🔹 Verifica se há um token de autorização no header
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // 🔹 Decodifica o token JWT para obter o UID do usuário
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 🔹 Obtém os dados enviados no corpo da requisição
    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // 🔹 Referência do documento do usuário no Firestore (Admin)
    const userRefAdmin = doc(adminDB, 'users-uk', userId);
    const userSnapAdmin = await getDoc(userRefAdmin);

    // 🔹 Se o usuário não for encontrado no Firebase Admin, tenta via Firebase Client SDK
    let userSnapClient = null;
    if (!userSnapAdmin.exists()) {
      console.warn(`⚠️ User ${userId} not found in Admin SDK, trying Client SDK...`);
      const userRefClient = doc(db, 'users-uk', userId);
      userSnapClient = await getDoc(userRefClient);
    }

    // 🔹 Se o usuário não existir em ambos os métodos, retorna erro
    if (!userSnapAdmin.exists() && (!userSnapClient || !userSnapClient.exists())) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔹 Atualiza os dados usando Firebase Admin SDK (preferível para segurança)
    await updateDoc(userRefAdmin, body);

    return NextResponse.json({ message: 'Store updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating store:', error);
    
    // 🔹 Tratamento de erros específicos
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
    }
    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
