"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Image from "next/image";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import Logo from "@/app/components/logo";
import Footer from "@/app/components/footer";

export default function AdDetailPage() {
  const { adsId } = useParams();
  const router = useRouter();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!adsId) return;

    // Função para buscar os dados do anúncio
    const fetchAd = async () => {
      const adRef = doc(db, "ads-uk", adsId);
      const adSnap = await getDoc(adRef);

      if (adSnap.exists()) {
        setAd(adSnap.data());
      }
      setLoading(false);
    };

    // Função para atualizar a contagem de views
    const updateViews = async () => {
      const storageKey = `view_${adsId}`;
      const lastViewTime = localStorage.getItem(storageKey);
      const now = new Date();

      if (lastViewTime) {
        const lastViewDate = new Date(lastViewTime);
        if (now.getTime() - lastViewDate.getTime() < 5 * 60 * 1000) {
          return;
        }
      }
      
      localStorage.setItem(storageKey, now.toISOString());
      
      const dd = now.getDate().toString().padStart(2, "0");
      const mm = (now.getMonth() + 1).toString().padStart(2, "0");
      const yyyy = now.getFullYear();
      const hh = now.getHours().toString().padStart(2, "0");
      const min = now.getMinutes().toString().padStart(2, "0");
      const timestamp = `${dd}/${mm}/${yyyy} - ${hh}:${min}`;

      const adRef = doc(db, "ads-uk", adsId);
      await updateDoc(adRef, {
        views: arrayUnion(timestamp),
      });
    };

    fetchAd();
    updateViews();
  }, [adsId]);

  // Função para lidar com o clique no botão "Chat with Owner"
  const handleChat = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Se o usuário não estiver logado, redireciona para a página de login do chat com o adsId na rota
    if (!user) {
      router.push(`/chat-ads-lg/${adsId}`);
      return;
    }

    // Verifica se os dados do anúncio e o campo createdBy estão disponíveis
    if (!ad || !ad.createdBy) {
      alert("Informações do dono do anúncio indisponíveis.");
      return;
    }

    const uid = user.uid;
    // Cria o chatId concatenando: uid do usuário que clicou, uid do dono (createdBy) e adsId
    const chatId = `${uid}_${ad.createdBy}_${adsId}`;

    // Mecanismo semelhante para viewsDetails (evita registros repetidos em menos de 5 minutos)
    const storageKey = `chat_${adsId}`;
    const lastChatTime = localStorage.getItem(storageKey);
    const now = new Date();

    if (!lastChatTime || now.getTime() - new Date(lastChatTime).getTime() >= 5 * 60 * 1000) {
      localStorage.setItem(storageKey, now.toISOString());
      
      const dd = now.getDate().toString().padStart(2, "0");
      const mm = (now.getMonth() + 1).toString().padStart(2, "0");
      const yyyy = now.getFullYear();
      const hh = now.getHours().toString().padStart(2, "0");
      const min = now.getMinutes().toString().padStart(2, "0");
      const timestamp = `${dd}/${mm}/${yyyy} - ${hh}:${min}`;

      const adRef = doc(db, "ads-uk", adsId);
      await updateDoc(adRef, {
        viewsDetails: arrayUnion(timestamp),
      });
    }

    // Redireciona para o chat passando o chatId
    router.push(`/chat-ads/${chatId}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  if (!ad)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Ad not found.
      </div>
    );

  return (
    <>
      <Logo />
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ad Images */}
        <div className="md:col-span-2">
          <div className="relative w-full h-[450px] overflow-hidden rounded-xl shadow-lg">
            {ad.images?.length > 0 ? (
              <Image
                src={ad.images[0]}
                alt="Ad Image"
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-xl">
                No Image Available
              </div>
            )}
          </div>
          {/* Ad Details */}
          <div className="mt-6 bg-white p-6 shadow-lg rounded-xl border border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{ad.address}</h1>
            <p className="text-gray-500 text-lg">{ad.postcode}</p>
            <div className="mt-6 border-t pt-6 space-y-4">
              <div className="flex justify-between text-xl font-semibold bg-gray-50 p-4 rounded-lg shadow-sm">
                <span>Price:</span>
                <span className="text-blue-600">${ad.price}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold bg-gray-50 p-4 rounded-lg shadow-sm">
                <span>Deposit:</span>
                <span className="text-blue-600">${ad.deposit}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold bg-gray-50 p-4 rounded-lg shadow-sm">
                <span>Type:</span>
                <span className="text-gray-700">{ad.type}</span>
              </div>
            </div>
            <div className="mt-6 border-t pt-6">
              <h2 className="text-2xl font-bold">Description</h2>
              <p className="mt-3 text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg shadow-sm">
                {ad.description}
              </p>
            </div>
            <div className="mt-6 border-t pt-6">
              <h2 className="text-2xl font-bold">Observations</h2>
              <p className="mt-3 text-gray-500 italic bg-gray-50 p-4 rounded-lg shadow-sm">
                {ad.observation}
              </p>
            </div>
          </div>
        </div>
        
        {/* User Panel */}
        <div className="bg-white p-6 shadow-xl rounded-xl flex flex-col items-center border border-gray-200">
          <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-2xl font-bold shadow-md">
            {ad.authorName?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-semibold mt-4 text-gray-900">{ad.authorName}</h2>
          <button
            onClick={handleChat}
            className="mt-6 w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-black transition-all shadow-md"
          >
            Chat with Owner
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
