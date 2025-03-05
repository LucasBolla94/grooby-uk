import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Pegando os parâmetros da URL
    const { searchParams } = new URL(req.url);
    const transaction = searchParams.get('transaction'); // "Buy" ou "Rent"
    const type = searchParams.get('type'); // "Homes" ou "Rooms"
    const city = searchParams.get('city'); // Nome da cidade
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1;
    const resultsPerPage = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 10;

    console.log(`🔎 Search Query: transaction=${transaction}, type=${type}, city=${city}, minPrice=${minPrice}, maxPrice=${maxPrice}`);

    // Validação dos parâmetros obrigatórios
    if (!transaction || !type || !city) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Criando a query no Firestore
    let adsQuery = query(
      collection(db, 'ads-uk'),
      where('transaction', '==', transaction),
      where('type', '==', type),
      where('city', '==', city),
      orderBy('price', 'asc'),
      limit(resultsPerPage)
    );

    // Adicionando filtros opcionais de preço
    if (minPrice !== null) adsQuery = query(adsQuery, where('price', '>=', minPrice));
    if (maxPrice !== null) adsQuery = query(adsQuery, where('price', '<=', maxPrice));

    // Buscando os anúncios no Firestore
    const querySnapshot = await getDocs(adsQuery);
    const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ results: ads, page, total: ads.length });
  } catch (error) {
    console.error('❌ Error fetching search results:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
