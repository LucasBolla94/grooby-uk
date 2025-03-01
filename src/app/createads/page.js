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
    if (files.length < 2) {
      alert('Please select at least 2 images.');
      return;
    }

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !title || !subtitle || !specs || !description || !price || images.length < 2) {
      alert('Please fill all fields and upload at least 2 photos.');
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
      formData.append('price', parseFloat(price));

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
          <input type="text" placeholder="Title" className="w-full p-3 border border-gray-300 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="text" placeholder="Subtitle" className="w-full p-3 border border-gray-300 rounded-md" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          <textarea placeholder="Specifications" className="w-full p-3 border border-gray-300 rounded-md" value={specs} onChange={(e) => setSpecs(e.target.value)}></textarea>
          <textarea placeholder="Description" className="w-full p-3 border border-gray-300 rounded-md" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          <input type="number" placeholder="Price (£)" className="w-full p-3 border border-gray-300 rounded-md" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input type="file" multiple accept="image/*" className="w-full p-3 border border-gray-300 rounded-md" onChange={handleImageUpload} />
          <div className="flex gap-2 overflow-x-auto py-3">
            {imagePreviews.map((img, index) => (
              <Image key={index} src={img} alt={`Preview ${index}`} width={96} height={96} className="w-24 h-24 object-cover rounded-md border border-gray-300" />
            ))}
          </div>
          <button type="submit" className="w-full p-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Ad'}
          </button>
        </form>
      )}
    </div>
  );
}
