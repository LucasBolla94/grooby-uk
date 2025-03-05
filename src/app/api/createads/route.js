import { adminDB, adminStorage } from '../../../lib/adminAuth';

export async function POST(request) {
  try {
    const adData = await request.json();
    // Usa "Categories" se existir, senão utiliza "category"
    const categoryValue = adData.Categories || adData.category;

    const {
      images,
      city,
      type,         // Valor detalhado vindo do formulário (não usado na busca)
      description,
      price,
      deposit,
      postcode,
      address,
      observations,
      uId, // ID do usuário que está criando o anúncio
    } = adData;

    // Mapeia o valor da categoria para os campos de busca "transaction" e "type"
    let transaction = '';
    let searchType = '';
    if (categoryValue === 'sell-property') {
      transaction = 'Buy';
      searchType = 'Homes';
    } else if (categoryValue === 'rent-property') {
      transaction = 'Rent';
      searchType = 'Homes';
    } else if (categoryValue === 'rent-room') {
      transaction = 'Rent';
      searchType = 'Rooms';
    }

    // Cria o documento do anúncio com os campos ajustados
    const adDocument = {
      originalCategory: categoryValue, // Guarda o valor da categoria enviado
      transaction,                     // Campo usado na busca (Buy ou Rent)
      type: searchType,                // Campo usado na busca (Homes ou Rooms)
      city,
      description,
      price: Number(price),
      deposit: Number(deposit),
      postcode,
      address,
      observations,
      images: [], // Inicialmente vazio
      createdAt: new Date(),
      checked: false,
      suspend: false, // Altere para true se o anúncio deve começar suspenso
      views: 0,
      viewsDetails: 0,
      createdBy: uId,
    };

    // Adiciona o documento à coleção 'ads-uk' e obtém seu ID (adId)
    const docRef = await adminDB.collection('ads-uk').add(adDocument);
    const adId = docRef.id;

    // Array para guardar as URLs públicas das imagens
    const imageUrls = [];

    // Se existirem imagens, faz o upload usando a nova estrutura de pastas:
    // 'ads-uk/uId/adId/arquivo'
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        let imageData = images[i];
        let base64Str = imageData;
        let contentType = 'image/jpeg';

        // Verifica se a string possui o header "data:image/..."
        if (imageData.startsWith('data:')) {
          const matches = imageData.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (matches) {
            contentType = matches[1];
            base64Str = matches[2];
          }
        }

        const buffer = Buffer.from(base64Str, 'base64');
        const fileExtension = contentType.split('/')[1];
        // Cria o caminho de arquivo usando uId e adId
        const fileName = `ads-uk/${uId}/${adId}/${Date.now()}_${i}.${fileExtension}`;
        const file = adminStorage.file(fileName);

        // Salva o arquivo no bucket com o metadata do contentType
        await file.save(buffer, {
          metadata: { contentType },
        });

        // Torna o arquivo público
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${fileName}`;
        imageUrls.push(publicUrl);
      }
    }

    // Atualiza o documento com as URLs das imagens
    await adminDB.collection('ads-uk').doc(adId).update({ images: imageUrls });

    return new Response(JSON.stringify({ success: true, id: adId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating ad: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
