'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image'; // Importando o componente Image do Next.js

export default function SellerPanel() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    storeName: '',
    profilePicture: '',
    coverPhoto: '',
    sellerLevel: 'Basic Seller',
    feedback: 0,
    address: '',
    address2: '',
    postcode: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users-uk', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setForm(userSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `stores/${user.uid}/${field}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    setForm((prev) => ({ ...prev, [field]: downloadURL }));
  };

  const validateUKPostcode = (postcode) => {
    const regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    return regex.test(postcode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.storeName || !form.profilePicture || !form.coverPhoto || !form.address || !form.postcode) {
      alert('All fields are required.');
      return;
    }

    if (!validateUKPostcode(form.postcode)) {
      alert('Invalid UK postcode.');
      return;
    }

    const userRef = doc(db, 'users-uk', user.uid);
    await setDoc(userRef, form, { merge: true });

    alert('Store information saved successfully!');
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg mt-10 rounded-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {form.storeName ? 'Manage Your Store' : 'Register Your Store'}
      </h1>

      {/* Cover Photo */}
      <div className="relative w-full h-48 md:h-56 bg-gray-300 rounded-md overflow-hidden">
        {form.coverPhoto ? (
          <Image src={form.coverPhoto} alt="Store Cover" layout="fill" objectFit="cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-700">Upload Cover Photo</div>
        )}
        <label className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded cursor-pointer">
          Change
          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'coverPhoto')} />
        </label>
      </div>

      {/* Profile Picture */}
      <div className="text-center mt-4">
        {form.profilePicture ? (
          <Image
            src={form.profilePicture}
            alt="Profile"
            width={128}
            height={128}
            className="rounded-full mx-auto"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto flex items-center justify-center text-sm text-gray-700">
            Upload Profile Picture
          </div>
        )}
        <label className="mt-2 block font-semibold cursor-pointer">
          Change Profile Picture
          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePicture')} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 w-full">
        <div className="w-full">
          <input
            type="text"
            name="storeName"
            placeholder="Store Name"
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.storeName}
            onChange={handleInputChange}
          />
        </div>

        <div className="w-full">
          <input
            type="text"
            name="address"
            placeholder="Business Address"
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.address}
            onChange={handleInputChange}
          />
        </div>

        <div className="w-full">
          <input
            type="text"
            name="address2"
            placeholder="Address 2 (Optional)"
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.address2}
            onChange={handleInputChange}
          />
        </div>

        <div className="w-full">
          <input
            type="text"
            name="postcode"
            placeholder="Postcode"
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.postcode}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          className="w-full p-4 bg-black text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {form.storeName ? 'Update Store' : 'Register Store'}
        </button>
      </form>
    </div>
  );
}
