'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EditStore from './editstore';

export default function SellerPanel({ setActiveTab }) {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeExists, setStoreExists] = useState(false);
  const [validPostcode, setValidPostcode] = useState(true);
  const [form, setForm] = useState({
    storeName: '',
    storeAddress: {
      Address1: '',
      Address2: '',
      PostCode: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users-uk', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const storeAddress = userData.storeAddress || { Address1: '', Address2: '', PostCode: '' };

          if (userData.storeName && storeAddress.Address1) {
            setStoreExists(true);
          } else {
            setForm({ ...userData, storeAddress });
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('storeAddress')) {
      setForm((prev) => ({
        ...prev,
        storeAddress: { ...prev.storeAddress, [name.split('.')[1]]: value },
      }));
      if (name === 'storeAddress.PostCode') {
        validatePostcode(value);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validatePostcode = async (postcode) => {
    if (!postcode.trim()) {
      setValidPostcode(true);
      return;
    }

    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}/validate`);
      const data = await response.json();
      setValidPostcode(data.result);
    } catch (error) {
      console.error('Error validating postcode:', error);
      setValidPostcode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.storeName || !form.storeAddress.Address1 || !form.storeAddress.PostCode) {
      alert('Store Name, Business Address, and Postcode are required.');
      return;
    }

    if (!validPostcode) {
      alert('Invalid UK postcode. Please enter a valid postcode.');
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Store registered successfully!');
        setStoreExists(true);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-4">
      {storeExists ? (
        <div className="flex flex-col md:flex-row">
          <div className="md:w-3/4">
            <EditStore />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg mt-10 rounded-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-center">Register Your Store</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="storeName"
              placeholder="Store Name"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={form.storeName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="storeAddress.Address1"
              placeholder="Business Address"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={form.storeAddress?.Address1 || ''}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="storeAddress.Address2"
              placeholder="Address 2 (Optional)"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={form.storeAddress?.Address2 || ''}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="storeAddress.PostCode"
              placeholder="Postcode"
              className={`w-full p-3 border rounded-md ${validPostcode ? 'border-gray-300' : 'border-red-500'}`}
              value={form.storeAddress?.PostCode || ''}
              onChange={handleInputChange}
            />
            {!validPostcode && <p className="text-red-500 text-sm">Invalid UK postcode.</p>}
            <button type="submit" className="w-full p-3 bg-black text-white rounded-md hover:bg-gray-900">
              Register Store
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
