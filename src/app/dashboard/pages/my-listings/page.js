// /src/app/dashboard/pages/my-listings.js
export default function MyListings() {
  // Exemplo de dados de anúncios. Em um projeto real, você buscaria esses dados de uma API.
  const listings = [
    {
      id: 1,
      image: '/images/property1.jpg',
      title: 'Cozy Apartment in London',
      status: 'Active',
      views: 120,
      messages: 10,
    },
    {
      id: 2,
      image: '/images/property2.jpg',
      title: 'Modern Flat in Manchester',
      status: 'Pending',
      views: 80,
      messages: 5,
    },
    {
      id: 3,
      image: '/images/property3.jpg',
      title: 'Spacious House in Birmingham',
      status: 'Expired',
      views: 200,
      messages: 15,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📌 My Listings</h1>
      <div className="grid gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white shadow rounded p-4 flex items-center">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-20 h-20 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{listing.title}</h2>
              <p>
                Status:{' '}
                <span
                  className={`font-semibold ${
                    listing.status === 'Active'
                      ? 'text-green-500'
                      : listing.status === 'Pending'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}
                >
                  {listing.status}
                </span>
              </p>
              <p>Views: {listing.views} | Messages: {listing.messages}</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Edit
              </button>
              <button className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                Pause
              </button>
              <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
