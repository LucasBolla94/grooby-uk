import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    console.log("📍 Buscando lista de cidades do Firestore...");

    // Referência para a coleção "ads-cities-uk"
    const citiesCollection = collection(db, "ads-cities-uk");
    
    // Obtém todos os documentos
    const querySnapshot = await getDocs(citiesCollection);

    // Mapeia os documentos para um array de cidades
    const cities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,   // Nome da cidade (exibido para o usuário)
      value: doc.data().value, // Valor interno (pode ser um código ou slug)
    }));

    console.log(`✅ ${cities.length} cidades carregadas com sucesso!`);

    return Response.json({ cities });
  } catch (error) {
    console.error("❌ Erro ao buscar cidades:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
