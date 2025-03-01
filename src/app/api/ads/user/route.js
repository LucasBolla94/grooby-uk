import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { adminAuth } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

// 🔹 Lista de origens permitidas - Adicionando mais portas para testes locais
const allowedOrigins = [
  'https://grooby.co.uk',
  'http://localhost:3000',
  'http://localhost:5173', // Vite
  'http://localhost:3001', // Next.js Dev
  'http://127.0.0.1:3000' // Outras variações do localhost
];

export async function GET(req) {
  try {
    // 🔍 Obtém a origem da requisição
    const origin = req.headers.get('origin');
    console.log('Origin:', origin);

    // 🚀 Permite requisições sem `origin` (como as feitas no Postman) apenas em ambiente local
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 🔹 Verifica se o usuário está autenticado
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // 🔥 Verifica e decodifica o token de autenticação
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const userId = decodedToken.uid;
    console.log('Authenticated User ID:', userId);

    // 🔹 Busca os anúncios do usuário logado
    const adsRef = collection(db, 'ads-uk');
    const q = query(adsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No ads found for user:', userId);
    }

    const userAds = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('User Ads:', userAds);

    return NextResponse.json({ success: true, ads: userAds });
  } catch (error) {
    console.error('Error fetching user ads:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}
