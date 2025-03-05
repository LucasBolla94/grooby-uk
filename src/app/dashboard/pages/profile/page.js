// /src/app/dashboard/pages/profile.js
export default function Profile() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">👤 Meu Perfil</h1>
      <form className="mt-6 space-y-4">
        {/* Foto de perfil e botão para alterar */}
        <div className="flex items-center">
          <img
            src="/images/default-profile.jpg"
            alt="Profile Picture"
            className="w-16 h-16 rounded-full mr-4"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Alterar Foto
          </button>
        </div>

        {/* Campo Nome */}
        <div>
          <label className="block text-gray-700">Nome:</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            defaultValue="Nome do Usuário"
          />
        </div>

        {/* Campo E-mail */}
        <div>
          <label className="block text-gray-700">E-mail:</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            defaultValue="email@exemplo.com"
          />
        </div>

        {/* Campo Telefone */}
        <div>
          <label className="block text-gray-700">Telefone:</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            defaultValue="(00) 00000-0000"
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
