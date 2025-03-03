import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { adminAuth, adminStorage } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    console.log('🔹 Recebendo requisição para criar anúncio...');

    // 1. Verificação de autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⛔ Falha na autenticação: Token ausente ou inválido');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken) {
      console.warn('⛔ Token inválido');
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
    console.log(`✅ Usuário autenticado: ${decodedToken.uid}`);

    // 2. Processamento dos dados do formulário
    const formData = await req.formData();
    // Certifique-se de que os inputs no front-end possuam o atributo "name" correspondente!
    const type = formData.get('type');
    const description = formData.get('description');
    const price = formData.get('price');
    const deposit = formData.get('deposit');
    const postcode = formData.get('postcode');
    const address = formData.get('address'); // Lembre-se de adicionar name="address" no input de endereço!
    const observations = formData.get('observations');
    const category = formData.get('category');
    const city = formData.get('city'); // Novo campo para capturar a cidade
    const images = formData.getAll('images');

    console.log('📋 Dados do anúncio:', { 
      type, description, price, deposit, postcode, address, observations, category, city, imagesCount: images.length 
    });

    // 3. Validação dos campos obrigatórios e quantidade mínima de imagens (mínimo 3, conforme o formulário)
    if (!type || !description || !price || !category || images.length < 3) {
      console.warn('⛔ Erro de validação: Campos obrigatórios ausentes ou imagens insuficientes');
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos e pelo menos 3 imagens devem ser enviadas.' },
        { status: 400 }
      );
    }

    // 4. Upload das imagens para o Firebase Storage
    console.log(`📤 Iniciando upload de ${images.length} imagens...`);
    const imageUrls = [];
    const bucket = adminStorage;

    for (const [index, image] of images.entries()) {
      try {
        console.log(`🖼️ Processando imagem ${index + 1}...`);
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const timestamp = Date.now();
        const fileExtension = image.type.split('/')[1];
        const fileName = `${decodedToken.uid}_${index + 1}_ads_${timestamp}.${fileExtension}`;
        const filePath = `ads-uk/${decodedToken.uid}/${fileName}`;

        console.log(`📂 Upload da imagem para: ${filePath}`);
        const file = bucket.file(filePath);
        await file.save(buffer, { metadata: { contentType: image.type } });

        // Torna o arquivo público e constrói a URL correta para acesso
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        imageUrls.push(publicUrl);
        console.log(`✅ Imagem ${index + 1} salva com sucesso: ${publicUrl}`);
      } catch (error) {
        console.error(`❌ Erro ao fazer upload da imagem ${index + 1}:`, error);
      }
    }

    if (imageUrls.length < 3) {
      console.warn('⛔ Erro: Não foi possível salvar pelo menos 3 imagens.');
      return NextResponse.json({ error: 'São necessárias pelo menos 3 imagens válidas.' }, { status: 400 });
    }

    // 5. Salvando os dados do anúncio no Firestore
    console.log('📝 Salvando anúncio no Firestore...');
    const adRef = await addDoc(collection(db, 'ads-uk'), {
      userId: decodedToken.uid,
      category,
      type,
      description,
      price: parseFloat(price),
      deposit: deposit ? parseFloat(deposit) : null,
      postcode,
      address,
      observations,
      city, // Armazenando a cidade junto aos outros dados
      imageUrls,
      createdAt: serverTimestamp(),
      views: 0,
      viewHistory: [],
      checked: false,
      suspend: false,
      isPremium: false,
    });
    console.log(`✅ Anúncio criado com sucesso! ID: ${adRef.id}`);

    return NextResponse.json({ success: true, adId: adRef.id, imageUrls });
  } catch (error) {
    console.error('❌ Erro geral na API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
