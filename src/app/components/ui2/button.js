// src/components/ui/button.js
export function Button({ children, onClick }) {
  return (
    <button
      className="bg-black text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
