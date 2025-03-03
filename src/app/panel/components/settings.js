'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';

export default function UserSettings() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email);
        setPhotoURL(currentUser.photoURL || '/default-profile.png');

        const userRef = doc(db, 'users-uk', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setPhone(userData.phone || '');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const userRef = doc(db, 'users-uk', user.uid);
      await updateDoc(userRef, {
        phone,
      });

      if (newPhoto) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, newPhoto);
        const photoURL = await getDownloadURL(storageRef);

        await updateProfile(user, { photoURL });
        await updateDoc(userRef, { photoURL });
        setPhotoURL(photoURL);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setNewPhoto(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (loading) return <div className="text-center p-6 text-lg font-semibold">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg mt-10 rounded-lg border border-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">⚙️ Settings</h1>

      <div className="flex flex-col items-center mb-6">
        <Image src={photoURL} alt="Profile Picture" width={120} height={120} className="w-32 h-32 rounded-full border-2 border-gray-300 shadow-md" />
        <label className="mt-3 cursor-pointer text-blue-600 hover:underline">
          Change Profile Picture
          <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
        </label>
      </div>

      {/* Formulário de Configurações */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">First Name</label>
          <input type="text" value={firstName} disabled className="w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500" />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Last Name</label>
          <input type="text" value={lastName} disabled className="w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500" />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-md focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input type="email" value={email} disabled className="w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500" />
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="w-full p-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
