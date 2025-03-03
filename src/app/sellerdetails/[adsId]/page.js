'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

const SellerDetails = () => {
  const router = useRouter();
  const { adsId } = useParams(); // Obtém o adsId da URL dinâmica

  const [seller, setSeller] = useState(null);
  const [product, setProduct] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      try {
        if (!adsId) {
          console.error('Missing adsId in the URL');
          return;
        }

        // Busca os dados do produto no Firestore (coleção: ads-uk)
        const productRef = doc(db, 'ads-uk', adsId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          setProduct(productData);

          // Agora busca os dados do vendedor no Firestore (coleção: users-uk)
          const sellerId = productData.userId;
          if (sellerId) {
            const sellerRef = doc(db, 'users-uk', sellerId);
            const sellerSnap = await getDoc(sellerRef);

            if (sellerSnap.exists()) {
              setSeller(sellerSnap.data());
            } else {
              console.error('Seller not found');
            }
          }
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product or seller:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndSeller();
  }, [adsId]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
  };

  if (loading) {
    return <p className="text-center text-xl font-bold p-10">Loading seller details...</p>;
  }

  if (!seller || !product) {
    return <p className="text-center text-xl font-bold p-10 text-red-500">Seller or product not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Painel do Vendedor */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between border border-gray-200">
        <div className="flex items-center gap-4">
          <Image
            src={seller.profilePicture || '/default-profile.png'}
            alt={seller.firstName}
            width={90}
            height={90}
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{seller.firstName}</h2>
            <p className="text-sm text-gray-600">⭐ {seller.rating || 'No rating yet'}</p>
          </div>
        </div>
        {/* Contato do Vendedor */}
        <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-end">
          {showPhone ? (
            <p className="text-gray-700 text-lg font-medium">📞 {seller.phone}</p>
          ) : (
            <button
              onClick={() => seller.byphone ? setShowPhone(true) : null}
              disabled={!seller.byphone}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                seller.byphone
                  ? 'bg-black hover:bg-gray-800 text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Show Contact
            </button>
          )}
          <button
            onClick={() => router.push(`/chat?sellerId=${product.userId}`)}
            className="mt-2 px-4 py-2 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition"
          >
            Chat with Seller
          </button>
        </div>
      </div>

      {/* Painel do Produto */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

        {/* Galeria de Imagens */}
        <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
          {/* Desktop: Setas de Navegação */}
          <div className="hidden sm:flex absolute inset-0 justify-between items-center">
            <button
              onClick={prevImage}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
            >
              ◀
            </button>
            <button
              onClick={nextImage}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
            >
              ▶
            </button>
          </div>

          {/* Mobile: Scroll Side */}
          <div className="sm:hidden flex overflow-x-scroll space-x-2 p-2 scrollbar-hide">
            {product.imageUrls?.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-full">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  width={500}
                  height={400}
                  className="w-auto h-72 object-contain"
                />
              </div>
            ))}
          </div>

          {/* Imagem Ativa */}
          <div className="hidden sm:flex justify-center items-center h-full">
            <Image
              src={product.imageUrls[currentImage] || '/default-image.jpg'}
              alt={`Product image ${currentImage + 1}`}
              width={500}
              height={400}
              className="w-auto h-full object-contain"
            />
          </div>
        </div>

        <p className="text-lg text-gray-700 mt-4 leading-relaxed">{product.description}</p>
        <p className="text-3xl font-bold text-black mt-4">£{product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default SellerDetails;
