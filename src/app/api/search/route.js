import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Extrai os parâmetros da URL
    const { searchParams } = new URL(req.url);
    const transaction = searchParams.get('transaction'); // "Buy" ou "Rent"
    const type = searchParams.get('type'); // "Homes" ou "Rooms"
    const city = searchParams.get('city'); // Nome da cidade
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null;
    // Define o limite padrão para 15 anúncios por vez
    const limitValue = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 15;
    const cursor = searchParams.get('cursor'); // Parâmetro opcional para paginação

    // Validação dos parâmetros obrigatórios
    if (!transaction || !type || !city) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Cria as restrições para a query, incluindo os anúncios verificados e não suspensos
    const constraints = [
      where('transaction', '==', transaction),
      where('type', '==', type),
      where('city', '==', city),
      where('checked', '==', true),
      where('suspend', '==', false)
    ];

    if (minPrice !== null) {
      constraints.push(where('price', '>=', minPrice));
    }
    if (maxPrice !== null) {
      constraints.push(where('price', '<=', maxPrice));
    }

    // Ordena por 'price' e 'createdAt' para garantir ordem estável
    constraints.push(orderBy('price', 'asc'));
    constraints.push(orderBy('createdAt', 'desc'));

    // Se houver um cursor, usa startAfter para buscar a próxima página
    if (cursor) {
      try {
        // Supomos que o cursor seja um JSON representando um array [price, createdAt]
        const parsedCursor = JSON.parse(cursor);
        constraints.push(startAfter(...parsedCursor));
      } catch (err) {
        console.error("Invalid cursor format:", err);
      }
    }

    constraints.push(limit(limitValue));

    const adsQuery = query(collection(db, 'ads-uk'), ...constraints);
    const querySnapshot = await getDocs(adsQuery);
    
    // Mapeia cada documento para incluir todos os dados e converte o createdAt para milissegundos
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toMillis() : null
      };
    });

    // Prepara o próximo cursor, caso haja mais documentos
    let nextCursor = null;
    if (querySnapshot.docs.length > 0) {
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      const lastData = lastDoc.data();
      nextCursor = JSON.stringify([lastData.price, lastData.createdAt.toMillis()]);
    }

    return NextResponse.json({ results, nextCursor, count: querySnapshot.size });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
