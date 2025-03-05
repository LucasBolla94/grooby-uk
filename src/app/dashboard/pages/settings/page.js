// /src/app/dashboard/pages/settings.js
"use client";

export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">⚙️ Configurações</h1>
      <form className="mt-6 space-y-4">
        {/* Campo para alterar senha */}
        <div>
          <label className="block text-gray-700">Alterar Senha:</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Nova Senha"
          />
        </div>

        {/* Campo de preferências */}
        <div>
          <label className="block text-gray-700">Preferências:</label>
          <select className="w-full border rounded px-3 py-2">
            <option>Preferência 1</option>
            <option>Preferência 2</option>
          </select>
        </div>

        {/* Checkbox de notificações */}
        <div className="flex items-center">
          <input type="checkbox" id="notifications" className="mr-2" />
          <label htmlFor="notifications" className="text-gray-700">
            Ativar Notificações
          </label>
        </div>

        {/* Botão para deletar conta com confirmação */}
        <div>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => {
              if (confirm("Tem certeza que deseja deletar sua conta?")) {
                // Lógica para deletar a conta
                alert("Conta deletada!");
              }
            }}
          >
            Deletar Conta
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Salvar Configurações
        </button>
      </form>
    </div>
  );
}
