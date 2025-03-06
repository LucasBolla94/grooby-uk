import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Extrai o uId do usuário a partir dos parâmetros da URL
    const { searchParams } = new URL(req.url);
    const uId = searchParams.get("uId");

    if (!uId) {
      return NextResponse.json({ error: "uId do usuário não informado" }, { status: 400 });
    }

    // Cria uma query para buscar apenas anúncios criados pelo usuário logado
    const adsQuery = query(
      collection(db, 'ads-uk'),
      where("createdBy", "==", uId)
    );
    const adsSnapshot = await getDocs(adsQuery);

    let activeListings = 0;
    let pendingListings = 0;
    let expiredListings = 0;
    let totalViews = 0;
    let viewsDetails = 0; // Soma dos contatos recebidos

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

      // Soma as visualizações, se o campo for um número
      if (typeof data.views === 'number') {
        totalViews += data.views;
      }

      // Soma os contatos recebidos (viewsDetails), se o campo for um número
      if (typeof data.contactsReceived === 'number') {
        viewsDetails += data.contactsReceived;
      }
    });

    return NextResponse.json(
      {
        activeListings,
        pendingListings,
        expiredListings,
        totalViews,
        viewsDetails,
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
