export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="text-gray-600 mt-2">Select an option from the menu.</p>
      {/* Resumo com informações do usuário */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold">Active Listings</h3>
          <p className="text-2xl">10</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold">Pending Listings</h3>
          <p className="text-2xl">5</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold">Expired Listings</h3>
          <p className="text-2xl">2</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold">Total Views</h3>
          <p className="text-2xl">1500</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold">Contacts Received</h3>
          <p className="text-2xl">25</p>
        </div>
      </div>
    </div>
  );
}
