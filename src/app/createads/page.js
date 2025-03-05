'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../components/logo';
import Footer from '../components/footer';
import { getAuth } from 'firebase/auth';

export default function CreateAdPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const auth = getAuth();

  // Estados do formulário
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // armazena o valor formatado
  const [deposit, setDeposit] = useState('');
  const [postcode, setPostcode] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [observations, setObservations] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]); // Estado para as cidades

  // Buscar categorias da API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/cat-create-ads');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        console.log('Fetched categories:', data);
        // Se a API retornar um array direto ou um objeto com a propriedade "categories"
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Buscar cidades da API
  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await fetch('/api/ads-uk-cities');
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
    fetchCities();
  }, []);

  // Seleção de categoria
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = categories.find((cat) => cat.id === categoryId);
    setFormFields(category?.formFields || []);
    setPropertyTypes(category?.propertyTypes || []);
  };

  // Upload e preview das imagens
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Funções para tratar o campo Price
  const handlePriceChange = (e) => {
    setPrice(e.target.value.replace('£', ''));
  };

  const handlePriceBlur = (e) => {
    let value = e.target.value.replace('£', '').trim();
    value = value.replace(/[^0-9.]/g, '');
    if (value) {
      const num = parseFloat(value);
      const formatted = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(num);
      setPrice(formatted);
    } else {
      setPrice('');
    }
  };

  // Funções para tratar o campo Deposit
  const handleDepositChange = (e) => {
    setDeposit(e.target.value.replace('£', ''));
  };

  const handleDepositBlur = (e) => {
    let value = e.target.value.replace('£', '').trim();
    value = value.replace(/[^0-9.]/g, '');
    if (value) {
      const num = parseFloat(value);
      const formatted = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(num);
      setDeposit(formatted);
    } else {
      setDeposit('');
    }
  };

  // Função para tratar o campo PostCode do Reino Unido
  const handlePostcodeBlur = (e) => {
    let value = e.target.value.trim().toUpperCase();
    // Remove todos os espaços para tratar o valor
    value = value.replace(/\s+/g, '');
    if (value.length > 3) {
      // Insere espaço antes dos últimos 3 caracteres
      value = value.slice(0, value.length - 3) + ' ' + value.slice(value.length - 3);
    }
    // Regex para validar o formato do postcode do UK
    const regex = /^(GIR ?0AA|[A-Z]{1,2}\d[A-Z\d]? ?\d[ABD-HJLNP-UW-Z]{2})$/;
    if (!regex.test(value)) {
      console.warn('Postcode inválido');
    }
    setPostcode(value);
  };

  // Função para submeter o formulário e enviar os dados para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Pega o usuário logado
    const currentUser = auth.currentUser;
    const uId = currentUser ? currentUser.uid : null;

    if (!uId) {
      console.error('Usuário não autenticado');
      setLoading(false);
      return;
    }

    // Prepara os dados para enviar
    const adData = {
      category: selectedCategory,
      city: selectedCity,
      type,
      description,
      price: price ? parseFloat(price.replace(/[^0-9.]/g, '')) : 0,
      deposit: deposit ? parseFloat(deposit.replace(/[^0-9.]/g, '')) : 0,
      postcode,
      address: selectedAddress,
      observations,
      images: imagePreviews,
      uId,
    };

    try {
      const response = await fetch('/api/createads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData)
      });
      if (!response.ok) throw new Error('Failed to publish ad');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Logo />
      <div className="flex-grow max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200 mt-8 mb-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create a New Listing</h2>
        {!selectedCategory ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Select a Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="p-4 text-white font-semibold rounded-lg bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 transition-all shadow-md"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p 
              className="text-lg font-semibold text-center bg-gray-100 p-3 rounded-md cursor-pointer hover:bg-gray-200 transition"
              onClick={() => setSelectedCategory('')}
            >
              Category: {categories.find((cat) => cat.id === selectedCategory)?.name} (Click to change)
            </p>
            <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
              {formFields.map((field) => {
                const lowerField = field.toLowerCase();
                if(lowerField === "city") {
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        name="city"
                      >
                        <option value="">Select a City</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                } else if(lowerField === "postcode") {
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        onBlur={handlePostcodeBlur}
                        name="postcode"
                        placeholder="e.g. SW1A 1AA"
                      />
                    </div>
                  );
                } else if(lowerField.includes('type')) {
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="">Select {field}</option>
                        {propertyTypes.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                } else if(lowerField === "price" || lowerField === "deposit") {
                  return (
                    <div key={field}>
                      <label className="block text-sm text-gray-600 mb-1">
                        {field === "Price" ? 'Price (£)' : 'Deposit (£)'} <span className="text-gray-400">(e.g. {field === "Price" ? '£1,200 per month' : '£600 one-time'})</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={field === "Price" ? price : deposit}
                        onChange={field === "Price" ? handlePriceChange : handleDepositChange}
                        onBlur={field === "Price" ? handlePriceBlur : handleDepositBlur}
                        name={field.toLowerCase().replace(/\s+/g, '-')}
                        placeholder={field === "Price" ? 'e.g. £1,200 per month' : 'e.g. £600 one-time'}
                      />
                    </div>
                  );
                } else if(lowerField === "description") {
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                      />
                    </div>
                  );
                } else if(lowerField === "address") {
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="address"
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        placeholder="Enter address"
                      />
                    </div>
                  );
                } else if(lowerField === "observations") {
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Enter observations"
                      />
                    </div>
                  );
                } else {
                  // Renderização padrão para demais campos
                  return (
                    <div key={field}>
                      <label className="block text-gray-700 font-semibold mb-1">{field}</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name={field.toLowerCase().replace(/\s+/g, '-')}
                      />
                    </div>
                  );
                }
              })}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full sm:w-auto p-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all"
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
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
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
              )}
              <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-6">
                <button
                  type="submit"
                  className="w-full sm:w-auto p-3 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-lg hover:from-black hover:to-gray-800 transition-all"
                  disabled={loading}
                >
                  {loading ? 'Publishing...' : 'Publish Ad'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
