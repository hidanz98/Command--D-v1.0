import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
