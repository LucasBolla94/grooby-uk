'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditAds() {
  // Utilizamos useParams para obter os parâmetros da rota
  const { listingId } = useParams();
  const router = useRouter();

  // Novos estados para os campos adicionais
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [observation, setObservation] = useState('');
  // Para o status vamos usar "Active" ou "Paused"
  const [status, setStatus] = useState('Active');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar os dados atuais do anúncio para pré-preencher o formulário
  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`/api/dashboard-listing?uId=all&id=${listingId}`);
        const data = await response.json();
        if (data.listing) {
          setPrice(data.listing.price || '');
          setDeposit(data.listing.deposit || '');
          setDescription(data.listing.description || '');
          setObservation(data.listing.observation || '');
          // Se o documento tiver a propriedade "paused" definida como true, o status será "Paused"
          setStatus(data.listing.paused ? "Paused" : "Active");
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        setError('Error fetching listing');
      } finally {
        setLoading(false);
      }
    }
    if (listingId) {
      fetchListing();
    } else {
      setError('No listing ID provided');
      setLoading(false);
    }
  }, [listingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/edit-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          id: listingId,
          data: {
            price,
            deposit,
            description,
            observation,
            // Define a propriedade 'paused' com base no status selecionado
            paused: status === 'Paused',
            // Também atualiza "checked" para false
            checked: false
          }
        })
      });
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/pages/my-listings');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error updating listing');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Price:</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            className="w-full p-2 border rounded" 
          />
        </div>
        <div>
          <label className="block mb-1">Deposit:</label>
          <input 
            type="number" 
            value={deposit} 
            onChange={(e) => setDeposit(e.target.value)} 
            className="w-full p-2 border rounded" 
          />
        </div>
        <div>
          <label className="block mb-1">Description:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full p-2 border rounded" 
          />
        </div>
        <div>
          <label className="block mb-1">Observation:</label>
          <textarea 
            value={observation} 
            onChange={(e) => setObservation(e.target.value)} 
            className="w-full p-2 border rounded" 
          />
        </div>
        <div>
          <label className="block mb-1">Status:</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="w-full p-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
