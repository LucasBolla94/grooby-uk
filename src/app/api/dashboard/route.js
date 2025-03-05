import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Obtém todos os anúncios da coleção 'ads-uk'
    const adsSnapshot = await getDocs(collection(db, 'ads-uk'));

    let activeListings = 0;
    let pendingListings = 0;
    let expiredListings = 0;
    let totalViews = 0;
    let contactsReceived = 0;

    adsSnapshot.forEach(doc => {
      const data = doc.data();

      // Anúncio ativo: verificado e não suspenso
      if (data.checked === true && data.suspend === false) {
        activeListings++;
      }

      // Anúncio pendente: não verificado
      if (data.checked === false) {
        pendingListings++;
      }

      // Anúncio expirado: se existir o campo 'expiry' e ele for anterior à data atual
      if (data.expiry && data.expiry.toMillis() < Date.now()) {
        expiredListings++;
      }

      // Soma as visualizações
      if (typeof data.views === 'number') {
        totalViews += data.views;
      }

      // Soma os contatos recebidos (caso exista a propriedade)
      if (typeof data.contactsReceived === 'number') {
        contactsReceived += data.contactsReceived;
      }
    });

    return NextResponse.json(
      {
        activeListings,
        pendingListings,
        expiredListings,
        totalViews,
        contactsReceived,
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
