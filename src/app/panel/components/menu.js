'use client';

export default function Menu({ setActiveTab }) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-md space-y-2">
      <button onClick={() => setActiveTab('Home')} className="block w-full p-2 rounded-md hover:bg-gray-700">Home</button>
      <button onClick={() => setActiveTab('Ads')} className="block w-full p-2 rounded-md hover:bg-gray-700">Ads</button>
      <button onClick={() => setActiveTab('Seller')} className="block w-full p-2 rounded-md hover:bg-gray-700">Seller</button>
      <button onClick={() => setActiveTab('Help')} className="block w-full p-2 rounded-md hover:bg-gray-700">Help</button>
      <button onClick={() => setActiveTab('Settings')} className="block w-full p-2 rounded-md hover:bg-gray-700">Settings</button>
    </div>
  );
}
