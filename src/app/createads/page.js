'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [description, setDescription] = useState(''); // Campo Description
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLimitReached, setImageLimitReached] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ads-categories-uk'));
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

  // Função para upload das imagens
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (images.length + files.length > 5) {
      alert('You can only upload a maximum of 5 images.');
      return;
    }
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setImages(prev => [...prev, ...files]);
    setImageLimitReached(images.length + files.length >= 5);
  };

  // Função para remover uma imagem da lista
  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageLimitReached(images.length - 1 >= 5);
  };

  // Função para formatar o campo de preço no padrão "£xx.xx"
  const handlePriceChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    const numberValue = parseInt(digits || '0', 10);
    const formattedValue = '£' + (numberValue / 100).toFixed(2);
    setPrice(formattedValue);
  };

  // Função de submissão do formulário que envia todos os dados para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!selectedCategory || !title || !subtitle || !specs || !description || !price) {
      alert('Please fill all fields.');
      return;
    }

    if (images.length < 2) {
      alert('Please upload at least 2 images.');
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

      // Adiciona cada campo do formulário no FormData
      formData.append('category', selectedCategory);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('specs', specs);
      // Envia o campo Description com o nome "description" (conforme a API espera)
      formData.append('description', description);
      // Converte o valor formatado de price para number removendo o símbolo "£"
      const numericPrice = parseFloat(price.replace('£', ''));
      formData.append('price', numericPrice);

      // Adiciona cada imagem individualmente no FormData
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

          {/* Campo Description */}
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
              placeholder="Enter price"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={price}
              onChange={handlePriceChange}
            />
          </div>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif,.HEIC,.HEIF"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Botão "Adicionar Foto" que aparece somente se houver menos que 5 fotos */}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full p-3 bg-gray-200 text-black font-semibold rounded-md hover:bg-gray-300 transition"
            >
              Adicionar Foto
            </button>
          )}

          <div className="flex gap-2 overflow-x-auto py-3">
            {imagePreviews.map((img, index) => (
              <div key={index} className="relative">
                <Image src={img} alt={`Preview ${index}`} width={96} height={96} className="w-24 h-24 object-cover rounded-md border border-gray-300" />
                {/* Botão "x" para remover a imagem */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-gray-800 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ))}
          </div>

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
