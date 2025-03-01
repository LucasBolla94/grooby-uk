import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, where, getDocs, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { adminAuth } from '../../../lib/adminAuth'; // Usamos adminAuth para verificação de token

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.headers.get('Authorization');
    const type = searchParams.get('type') || 'most-viewed';
    const searchTerm = searchParams.get('query') || '';
    const pageSize = 10;
    let isAuthenticated = false;
    let userId = null;

    // Se houver token, tenta verificar com adminAuth
    if (token) {
      try {
        // Removemos o prefixo "Bearer " se presente
        const bearerToken = token.startsWith('Bearer ') ? token.split('Bearer ')[1] : token;
        const user = await adminAuth.verifyIdToken(bearerToken);
        isAuthenticated = !!user;
        userId = user.uid;
      } catch (error) {
        console.warn('Invalid token:', error);
      }
    }

    let q;
    // Usamos a coleção "ads-uk" para todas as consultas
    if (type === 'search' && searchTerm) {
      q = query(
        collection(db, 'ads-uk'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(pageSize)
      );
    } else if (type === 'latest') {
      q = query(
        collection(db, 'ads-uk'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    } else { // "most-viewed" ou default
      q = query(
        collection(db, 'ads-uk'),
        orderBy('views', 'desc'),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const listings = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        // Se o usuário não estiver autenticado, podemos forçar isPremium a false ou outra lógica
        isPremium: isAuthenticated ? data.isPremium : false,
      };
    });

    // Retorna também a última listagem para paginação se necessário
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return Response.json({ listings, lastVisible });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return Response.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, adId } = await req.json();
    if (!userId || !adId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const userFavoritesRef = doc(db, 'favorites', userId);
    await setDoc(userFavoritesRef, { ads: arrayUnion(adId) }, { merge: true });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error saving favorite:', error);
    return Response.json({ error: 'Failed to save favorite' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId, adId, updates } = await req.json();
    if (!userId || !adId || !updates) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const adRef = doc(db, 'ads-uk', adId); // Use "ads-uk" para manter consistência
    const adDoc = await getDoc(adRef);
    if (!adDoc.exists()) {
      return Response.json({ error: 'Ad not found' }, { status: 404 });
    }
    
    if (adDoc.data().ownerId !== userId) {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    await updateDoc(adRef, updates);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating ad:', error);
    return Response.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}
