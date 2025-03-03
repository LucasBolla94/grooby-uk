'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';

export default function SellerPanel() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [originalData, setOriginalData] = useState({});

  // Placeholders padrão para imagens
  const placeholderProfile = '/default-profile.png'; // Foto de perfil padrão
  const placeholderCover = '/default-cover.jpg'; // Foto de capa padrão

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchUserData = async (uid) => {
    const userRef = doc(db, 'users-uk', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      setForm(userData);
      setOriginalData(userData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `stores/${user.uid}/${field}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    setForm((prev) => ({ ...prev, [field]: downloadURL }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Filtra apenas os campos modificados
    const updatedFields = Object.keys(form).reduce((acc, key) => {
      if (form[key] !== originalData[key]) {
        acc[key] = form[key];
      }
      return acc;
    }, {});

    if (Object.keys(updatedFields).length === 0) {
      alert('No changes detected.');
      setSaving(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/editstore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) throw new Error('Failed to update store');

      alert('Store updated successfully!');
      setOriginalData({ ...originalData, ...updatedFields }); // Atualiza os dados salvos
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Failed to update store.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg mt-10 rounded-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center">Manage Your Store</h1>

      {/* Cover Photo */}
      <div className="relative w-full h-48 md:h-56 bg-gray-300 rounded-md overflow-hidden">
        <Image
          src={form.coverPhoto || placeholderCover}
          alt="Store Cover"
          layout="fill"
          objectFit="cover"
        />
        <label className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded cursor-pointer">
          Change
          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'coverPhoto')} />
        </label>
      </div>

      {/* Profile Picture */}
      <div className="text-center mt-4">
        <Image
          src={form.profilePicture || placeholderProfile}
          alt="Profile"
          width={128}
          height={128}
          className="rounded-full mx-auto"
        />
        <label className="mt-2 block font-semibold cursor-pointer">
          Change Profile Picture
          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePicture')} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 w-full">
        <input
          type="text"
          name="storeName"
          placeholder="Store Name"
          className="w-full p-4 border border-gray-300 rounded-md"
          value={form.storeName || ''}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Business Address"
          className="w-full p-4 border border-gray-300 rounded-md"
          value={form.address || ''}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="postcode"
          placeholder="Postcode"
          className="w-full p-4 border border-gray-300 rounded-md"
          value={form.postcode || ''}
          onChange={handleInputChange}
        />

        <button
          type="submit"
          className="w-full p-4 bg-black text-white rounded-md hover:bg-gray-800 transition shadow-lg"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Store'}
        </button>
      </form>
    </div>
  );
}
