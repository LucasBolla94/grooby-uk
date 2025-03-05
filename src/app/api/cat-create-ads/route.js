import { adminDB, adminStorage } from '../../../lib/adminAuth';

// GET: Retorna a lista de categorias para o front-end
export async function GET(req) {
  try {
    const categories = [
      {
        id: 'rent-property',
        name: 'Rent Property',
        formFields: ['Property Type', 'Price', 'Deposit', 'Description', 'Observations', 'City', 'Address', 'PostCode'],
        propertyTypes: [
          'Flat / Apartment', 'Studio Flat', 'Maisonette', 'Terraced House', 'Semi-Detached House', 'Detached House', 'Bungalow', 'Cottage', 'Houseboat'
        ]
      },
      {
        id: 'rent-room',
        name: 'Rent Room',
        formFields: ['Room Type', 'Price', 'Deposit', 'Description', 'Observations', 'City', 'Address', 'PostCode'],
        propertyTypes: [
          'Single Room', 'Double Room', 'En-suite Room', 'Studio', 'Shared Accommodation'
        ]
      },
      {
        id: 'sell-property',
        name: 'Sell Property',
        formFields: ['Property Type', 'Selling Price', 'Description', 'Observations', 'City', 'Address', 'PostCode'],
        propertyTypes: [
          'Flat / Apartment', 'Studio Flat', 'Maisonette', 'Terraced House', 'Semi-Detached House', 'Detached House', 'Bungalow', 'Cottage', 'Houseboat', 'Commercial Property', 'Land / Plot'
        ]
      }
    ];

    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST: Cria um anúncio com os dados enviados pelo front-end
export async function POST(request) {
  try {
    const adData = await request.json();
    const {
      images,
      Categories, // Campo enviado pelo front-end com a categoria selecionada
      city,
      type,         // Valor detalhado do formulário (não usado na busca)
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
    if (Categories === 'sell-property') {
      transaction = 'Buy';
      searchType = 'Homes';
    } else if (Categories === 'rent-property') {
      transaction = 'Rent';
      searchType = 'Homes';
    } else if (Categories === 'rent-room') {
      transaction = 'Rent';
      searchType = 'Rooms';
    }

    // Cria o documento do anúncio com os campos ajustados
    const adDocument = {
      originalCategory: Categories,
      transaction,         // Usado na busca (Buy ou Rent)
      type: searchType,    // Usado na busca (Homes ou Rooms)
      city,
      description,
      price: Number(price),
      deposit: Number(deposit),
      postcode,
      address,
      observations,
      images: [], // Inicialmente vazio; será atualizado após o upload das imagens
      createdAt: new Date(),
      checked: false,
      suspend: false,
      views: 0,
      viewsDetails: 0,
      createdBy: uId,
    };

    // Adiciona o documento à coleção 'ads-uk' e obtém seu ID
    const docRef = await adminDB.collection('ads-uk').add(adDocument);
    const adId = docRef.id;

    // Array para armazenar as URLs públicas das imagens
    const imageUrls = [];

    // Faz o upload das imagens, se houver, e atualiza o documento com as URLs
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
        const fileName = `ads-uk/${uId}/${adId}/${Date.now()}_${i}.${fileExtension}`;
        const file = adminStorage.file(fileName);

        await file.save(buffer, {
          metadata: { contentType },
        });

        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${fileName}`;
        imageUrls.push(publicUrl);
      }
    }

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
