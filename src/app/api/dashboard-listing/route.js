import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const uId = searchParams.get('uId');

    if (id) {
      // Se um id for fornecido, busca o anúncio específico
      const docRef = doc(db, 'ads-uk', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({ listing: { id: docSnap.id, ...docSnap.data() } });
    } else if (uId) {
      if (uId === 'all') {
        // Se uId for "all", retorna todos os anúncios.
        const adsSnapshot = await getDocs(collection(db, 'ads-uk'));
        const listings = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ listings });
      } else {
        // Filtra anúncios pelo campo "createdBy"
        const q = query(collection(db, 'ads-uk'), where('createdBy', '==', uId));
        const querySnapshot = await getDocs(q);
        const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ listings });
      }
    } else {
      return NextResponse.json(
        { error: 'Missing id or uId parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching dashboard listing(s):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
