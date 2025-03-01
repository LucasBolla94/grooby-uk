import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { adminAuth } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

const allowedOrigins = ['https://grooby.co.uk', 'http://localhost:3000'];

export async function POST(req) {
  try {
    // Verifica a origem da requisição
    const origin = req.headers.get('origin');
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden: Invalid origin' }, { status: 403 });
    }

    // Verifica se o token está presente no cabeçalho
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verifica o token do usuário via Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 403 });
    }

    const userId = decodedToken.uid;

    // Obtém os dados enviados no corpo da requisição
    const { storeName, storeAddress } = await req.json();

    // Validação dos campos obrigatórios
    if (!storeName || !storeAddress?.Address1 || !storeAddress?.PostCode) {
      return NextResponse.json({ error: 'Missing required fields: storeName, Address1, PostCode' }, { status: 400 });
    }

    // Verifica se o Postcode é válido no Reino Unido
    const isValidPostcode = await validatePostcode(storeAddress.PostCode);
    if (!isValidPostcode) {
      return NextResponse.json({ error: 'Invalid UK postcode' }, { status: 400 });
    }

    // Salva ou atualiza os dados da loja no Firestore
    const userRef = doc(db, 'users-uk', userId);
    await setDoc(userRef, { storeName, storeAddress }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Store information saved successfully!',
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Função para validar Postcode do Reino Unido
async function validatePostcode(postcode) {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}/validate`);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error validating postcode:', error);
    return false;
  }
}
