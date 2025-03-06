"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { app } from "@/firebase/config";

const db = getFirestore(app);
const auth = getAuth(app);

export default function AdDetailPage() {
  const router = useRouter();
  const { adsId } = router.query;
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adsId) return;

    const fetchAd = async () => {
      const adRef = doc(db, "ads-uk", adsId);
      const adSnap = await getDoc(adRef);

      if (adSnap.exists()) {
        setAd(adSnap.data());
      }
      setLoading(false);
    };

    fetchAd();
  }, [adsId]);

  if (loading) return <p>Loading...</p>;
  if (!ad) return <p>Ad not found.</p>;

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Ad Images */}
      <div className="md:col-span-2">
        <div className="flex overflow-x-auto space-x-4 p-2 scrollbar-hide">
          {ad.images?.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-80">
              <Image src={image} alt="Ad Image" width={800} height={500} className="rounded-lg" />
            </div>
          ))}
        </div>
        {/* Ad Details */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{ad.address}</h1>
          <p className="text-gray-600">{ad.postCode}</p>
          <p className="text-lg font-semibold mt-2">${ad.price} / Deposit: ${ad.deposit}</p>
          <p className="mt-4">{ad.description}</p>
          <p className="text-gray-500 mt-2">{ad.observation}</p>
          <p className="text-sm font-medium text-gray-700 mt-2">Type: {ad.type}</p>
        </div>
      </div>
      
      {/* User Panel */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h2 className="text-xl font-bold">Listed by</h2>
        <p className="text-gray-700">{ad.authorName}</p>
        <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
          Chat with Owner
        </button>
      </div>
    </div>
  );
}
