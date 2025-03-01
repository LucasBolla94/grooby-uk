import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { adminAuth } from '@/lib/adminAuth'; // Firebase Admin SDK para autenticação segura
import { NextResponse } from 'next/server';

// Apenas permite requests do frontend do Grooby
const allowedOrigins = ['https://grooby.co.uk', 'http://localhost:3000'];

export async function PATCH(req, { params }) {
  try {
    // Verifica se o request vem de uma origem permitida
    const origin = req.headers.get('origin');
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verifica se o usuário está autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const userId = decodedToken.uid;
    const { adId } = params;
    const { title, description, price } = await req.json();

    // Busca o anúncio no Firestore
    const adRef = doc(db, 'ads-uk', adId);
    const adSnap = await getDoc(adRef);

    if (!adSnap.exists()) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const adData = adSnap.data();

    // Verifica se o anúncio pertence ao usuário logado
    if (adData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Atualiza o anúncio no Firestore
    await updateDoc(adRef, {
      title: title || adData.title,
      description: description || adData.description,
      price: price !== undefined ? price : adData.price,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Ad updated successfully!' });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    // Verifica se o request vem de uma origem permitida
    const origin = req.headers.get('origin');
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verifica se o usuário está autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const userId = decodedToken.uid;
    const { adId } = params;

    // Busca o anúncio no Firestore
    const adRef = doc(db, 'ads-uk', adId);
    const adSnap = await getDoc(adRef);

    if (!adSnap.exists()) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const adData = adSnap.data();

    // Verifica se o anúncio pertence ao usuário logado
    if (adData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Deleta o anúncio no Firestore
    await deleteDoc(adRef);

    return NextResponse.json({ success: true, message: 'Ad deleted successfully!' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}
