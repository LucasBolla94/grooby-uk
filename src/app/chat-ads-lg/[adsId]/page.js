"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getDatabase, ref, push } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { db } from "@/lib/firebase";
import Logo from "@/app/components/logo";
import Footer from "@/app/components/footer";

export default function ChatAdsLoginPage() {
  const { adsId } = useParams();

  // Estado para armazenar os dados do anúncio e seu carregamento
  const [ad, setAd] = useState(null);
  const [loadingAd, setLoadingAd] = useState(true);

  useEffect(() => {
    if (!adsId) return;
    async function fetchAd() {
      try {
        const adRef = doc(db, "ads-uk", adsId);
        const adSnap = await getDoc(adRef);
        if (adSnap.exists()) {
          setAd(adSnap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar dados do anúncio:", error);
      }
      setLoadingAd(false);
    }
    fetchAd();
  }, [adsId]);

  // Estado para o formulário
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dbRealtime = getDatabase();
    const chatAdsRef = ref(dbRealtime, "chat-ads");
    try {
      // Envia os dados do formulário para o Realtime DB com uselogin false, 
      // inclui o adsId, sellerId (owner do anúncio) e um timestamp
      await push(chatAdsRef, {
        ...formData,
        uselogin: false,
        adsId,
        sellerId: ad?.createdBy || null,
        timestamp: Date.now(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Erro ao enviar a mensagem:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Logo />
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

        {/* Card com dados do anúncio */}
        {loadingAd ? (
          <div className="text-center">Loading ad details...</div>
        ) : ad ? (
          <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row items-center">
              {ad.images && ad.images.length > 0 && (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={ad.images[0]}
                    alt="Ad Thumbnail"
                    fill
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              )}
              <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                {ad.postcode && (
                  <div className="text-lg font-semibold text-gray-800">
                    {ad.postcode}
                  </div>
                )}
                {ad.price && (
                  <div className="text-xl text-blue-600 font-bold">
                    ${ad.price}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-600">Ad not found</div>
        )}

        {submitted ? (
          <div className="text-center text-green-600 text-xl">
            Your message has been sent successfully!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
