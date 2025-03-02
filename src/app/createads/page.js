'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image'; // Importando o Image do Next.js

export default function CreateAdPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [specs, setSpecs] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLimitReached, setImageLimitReached] = useState(false); // Flag to track if the limit is reached
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          value: doc.data().value
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (images.length + files.length > 5) {
      alert('You can only upload a maximum of 5 images.');
      return;
    }
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setImages(prev => [...prev, ...files]);
    setImageLimitReached(images.length + files.length >= 5); // Update limit flag
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    // Remove non-numeric characters except for the decimal point
    value = value.replace(/[^\d.]/g, '');
    // Ensure that the value has at most two decimal places
    if (value.indexOf('.') !== -1) {
      const [whole, decimal] = value.split('.');
      value = `${whole}.${decimal.slice(0, 2)}`;
    }
    // Format the value as £xx.xx
    if (value) {
      const formattedValue = `£${parseFloat(value).toFixed(2)}`;
      setPrice(formattedValue);
    } else {
      setPrice('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !title || !subtitle || !specs || !description || !price) {
      alert('Please fill all fields.');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to create an ad.');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('category', selectedCategory);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('specs', specs);
      formData.append('description', description);
      formData.append('price', parseFloat(price.replace('£', '').replace(',', '')));

      images.forEach((image) => {
        formData.append('images', image); 
      });

      const response = await fetch('/api/createads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Ad created successfully!');
        router.push('/');
      } else {
        alert(`Failed to create ad: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md mt-10 rounded-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center">Create a New Listing</h2>

      {!selectedCategory ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Select a Category</h3>
          <select
            className="w-full p-3 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-black"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Choose a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.value}>{category.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter title"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="subtitle">Subtitle</label>
            <input
              id="subtitle"
              type="text"
              placeholder="Enter subtitle"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="specs">Specifications</label>
            <textarea
              id="specs"
              placeholder="Enter specifications"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter description"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="price">Price (£)</label>
            <input
              id="price"
              type="text"
              placeholder="£00.00"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={price}
              onChange={handlePriceChange}
            />
          </div>

          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full p-3 border border-gray-300 rounded-md"
              onChange={handleImageUpload}
              disabled={imageLimitReached}
            />
            <p className={`text-sm text-gray-500 ${imageLimitReached ? 'hidden' : ''}`}>You can upload up to 5 photos.</p>
            {imageLimitReached && <p className="text-sm text-red-500">You have reached the maximum photo limit (5).</p>}
          </div>

          <div className="flex gap-2 overflow-x-auto py-3">
            {imagePreviews.map((img, index) => (
              <Image key={index} src={img} alt={`Preview ${index}`} width={96} height={96} className="w-24 h-24 object-cover rounded-md border border-gray-300" />
            ))}
          </div>

          {!imageLimitReached && (
            <button
              type="button"
              className="w-full p-3 bg-gray-200 text-black font-semibold rounded-md hover:bg-gray-300 transition"
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              Add more photos
            </button>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Ad'}
          </button>
        </form>
      )}
    </div>
  );
}
