'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';

export default function CreateAdPage() {
  const router = useRouter();
  const auth = getAuth();
  const fileInputRef = useRef(null);

  // Estados do formulário principal
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [postcode, setPostcode] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [observations, setObservations] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lista de categorias
  const categories = [
    { id: 'rent-property', name: 'Rent Property' },
    { id: 'rent-room', name: 'Rent Room' },
    { id: 'sell-property', name: 'Sell Property' },
  ];

  // Tipos por categoria
  const propertyTypes = {
    'rent-property': [
      'Flat / Apartment',
      'Studio Flat',
      'Maisonette',
      'Terraced House',
      'Semi-Detached House',
      'Detached House',
      'Bungalow',
      'Cottage',
      'Houseboat'
    ],
    'rent-room': [
      'Single Room',
      'Double Room',
      'En-suite Room',
      'Studio',
      'Shared Accommodation'
    ],
    'sell-property': [
      'Flat / Apartment',
      'Studio Flat',
      'Maisonette',
      'Terraced House',
      'Semi-Detached House',
      'Detached House',
      'Bungalow',
      'Cottage',
      'Houseboat',
      'Commercial Property',
      'Land / Plot'
    ]
  };

  // Limites de imagens por categoria
  const imageLimits = {
    'rent-property': 25,
    'rent-room': 10,
    'sell-property': 10
  };

  // Função para formatar preço (£xx.xx)
  const formatCurrency = (value) => {
    const digits = value.replace(/\D/g, '');
    return '£' + (parseInt(digits || '0', 10) / 100).toFixed(2);
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

  // Função para enviar o formulário e chamar a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Obter token do usuário para autenticação
      const token = await auth.currentUser.getIdToken();
      const formData = new FormData(e.target);
      // Adiciona valores não vinculados aos inputs
      formData.append('category', selectedCategory);
      formData.append('address', selectedAddress);
      // O input hidden já garante o envio de 'city', mas reforçamos:
      formData.set('city', selectedCity);

      // Converte Price e Deposit para números
      const numericPrice = parseFloat(price.replace('£', ''));
      formData.set('price', numericPrice);
      if (deposit) {
        const numericDeposit = parseFloat(deposit.replace('£', ''));
        formData.set('deposit', numericDeposit);
      }

      // Chamada para a API
      const response = await fetch('/api/createads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await response.json();
      console.log('API response:', result);
      if (result.success) {
        router.push(`/ads/${result.adId}`);
      } else {
        alert("Erro ao publicar anúncio: " + result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar o anúncio:', error);
      alert("Erro ao publicar anúncio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md border border-gray-300 mt-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create a New Listing</h2>

      {/* Se nenhuma categoria foi selecionada, exibe o select de categorias */}
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
        // Se a categoria foi selecionada, mas a cidade ainda não foi escolhida, mostra o select de cidades
        !selectedCity ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Select a City</h3>
            <CitySelect selectedCity={selectedCity} setSelectedCity={setSelectedCity} />
            <button
              className="mt-4 p-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition"
              onClick={() => setSelectedCategory('')}
            >
              Change Category
            </button>
          </div>
        ) : (
          // Se a categoria e a cidade foram selecionadas, exibe o formulário completo
          <form onSubmit={handleSubmit} className="space-y-6">
            <p
              className="text-lg font-semibold text-center bg-gray-100 p-3 rounded-md cursor-pointer hover:bg-gray-200 transition"
              onClick={() => {
                setSelectedCategory('');
                setSelectedCity('');
              }}
            >
              Category: {categories.find(cat => cat.id === selectedCategory)?.name} | City: {selectedCity} (Click to change)
            </p>

            {/* Input hidden para garantir o envio do campo city */}
            <input type="hidden" name="city" value={selectedCity} />

            {/* Tipo de Imóvel */}
            <div>
              <label className="block text-gray-700 font-semibold">Property Type</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={type}
                onChange={(e) => setType(e.target.value)}
                name="type"
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
                name="description"
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
                  name="price"
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
                    name="deposit"
                  />
                </div>
              )}
            </div>

            {/* Endereço e Observações */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 font-semibold">PostCode</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Digite o postcode do UK"
                  name="postcode"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">Address</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  name="address"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">OBS: Observações</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Digite suas observações"
                  name="observations"
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
                name="images"
              />
              <div className="grid grid-cols-4 gap-3 mt-3">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={img}
                      alt={`Preview ${index}`}
                      width={100}
                      height={100}
                      className="w-24 h-24 object-cover rounded-md border border-gray-300"
                    />
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
        )
      )}
    </div>
  );
}

// Componente para seleção de cidade, que busca as cidades da API /api/ads-uk-cities
function CitySelect({ selectedCity, setSelectedCity }) {
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      try {
        setLoadingCities(true);
        const response = await fetch('/api/ads-uk-cities');
        if (!response.ok) {
          console.error(`Erro na API: ${response.status}`);
          setLoadingCities(false);
          return;
        }
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      } finally {
        setLoadingCities(false);
      }
    }
    fetchCities();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <select
        value={selectedCity}
        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
        onChange={(e) => setSelectedCity(e.target.value)}
      >
        <option value="">Select a City</option>
        {loadingCities ? (
          <option>Loading cities...</option>
        ) : cities.length > 0 ? (
          cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))
        ) : (
          <option>No cities available</option>
        )}
      </select>
    </div>
  );
}
