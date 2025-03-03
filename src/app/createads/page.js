'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';

export default function CreateAdPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [postcode, setPostcode] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(''); // Novo estado para endereço selecionado
  const [observations, setObservations] = useState(''); // Novo estado para observações
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const auth = getAuth();

  // Lista de categorias
  const categories = [
    { id: 'rent-property', name: 'Rent Property' },
    { id: 'rent-room', name: 'Rent Room' },
    { id: 'sell-property', name: 'Sell Property' },
  ];

  // Tipos por categoria
  const propertyTypes = {
    'rent-property': ['Flat / Apartment', 'Studio Flat', 'Maisonette', 'Terraced House', 'Semi-Detached House', 'Detached House', 'Bungalow', 'Cottage', 'Houseboat'],
    'rent-room': ['Single Room', 'Double Room', 'En-suite Room', 'Studio', 'Shared Accommodation'],
    'sell-property': ['Flat / Apartment', 'Studio Flat', 'Maisonette', 'Terraced House', 'Semi-Detached House', 'Detached House', 'Bungalow', 'Cottage', 'Houseboat', 'Commercial Property', 'Land / Plot']
  };

  // Limites de imagens por categoria
  const imageLimits = {
    'rent-property': 25,
    'rent-room': 10,
    'sell-property': 10
  };

  // Upload de imagens
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxImages = imageLimits[selectedCategory] || 10;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setImages(prev => [...prev, ...files]);
  };

  // Remover imagem
  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Formatar preço (£xx.xx)
  const formatCurrency = (value) => {
    const digits = value.replace(/\D/g, '');
    return '£' + (parseInt(digits || '0', 10) / 100).toFixed(2);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md border border-gray-300 mt-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create a New Listing</h2>

      {!selectedCategory ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Select a Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                className="p-4 text-white font-semibold rounded-lg bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 transition-all shadow-md"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form className="space-y-6">
          {/* Trocar de categoria clicando no nome */}
          <p
            className="text-lg font-semibold text-center bg-gray-100 p-3 rounded-md cursor-pointer hover:bg-gray-200 transition"
            onClick={() => setSelectedCategory('')}
          >
            Category: {categories.find(cat => cat.id === selectedCategory)?.name} (Click to change)
          </p>

          {/* Tipo de Imóvel */}
          <div>
            <label className="block text-gray-700 font-semibold">Property Type</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select a type</option>
              {propertyTypes[selectedCategory]?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-gray-700 font-semibold">Description</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <p className="text-sm text-gray-500">Max 500 characters</p>
          </div>

          {/* Preço & Depósito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold">Price (£)</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={price}
                onChange={(e) => setPrice(formatCurrency(e.target.value))}
              />
            </div>
            {selectedCategory !== 'sell-property' && (
              <div>
                <label className="block text-gray-700 font-semibold">Deposit (£)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={deposit}
                  onChange={(e) => setDeposit(formatCurrency(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Campos de Endereço e Observações */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-semibold">PostCode</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Digite o postcode do UK"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Address</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
              </textarea>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">OBS: Observações</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Digite suas observações"
              ></textarea>
            </div>
          </div>

          {/* Upload de imagens */}
          <div>
            <label className="block text-gray-700 font-semibold">
              Upload Photos (Min 3 - Max {imageLimits[selectedCategory]})
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full p-3 bg-gray-900 text-white font-semibold rounded-md hover:bg-black transition-all"
            >
              Add Photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="grid grid-cols-4 gap-3 mt-3">
              {imagePreviews.map((img, index) => (
                <div key={index} className="relative">
                  <Image src={img} alt={`Preview ${index}`} width={100} height={100} className="w-24 h-24 object-cover rounded-md border border-gray-300" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-gray-800 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
                  >x</button>
                </div>
              ))}
            </div>
          </div>
          {/* Botão para publicar anúncio */}
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-md hover:from-black hover:to-gray-800 transition-all mt-4"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Ad'}
          </button>

        </form>
      )}
    </div>
  );
}
