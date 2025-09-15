import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '../../components/Button';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/consultas');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-redfemLighterGray bg-gradient-to-br from-redfemLightPink to-redfemHoverPink flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Ícone 404 */}
        <div className="mb-6">
          <div className="text-6xl font-bold text-redfemActionPink mb-2">404</div>
          <div className="w-16 h-1 bg-redfemActionPink mx-auto rounded"></div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Página não encontrada
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-8">
          Oops! A página que você está procurando não foi encontrada.
          Ela pode ter sido removida, renomeada ou está temporariamente indisponível.
        </p>

        {/* Botões de ação */}
        <div className="space-y-3">
          <ButtonPrimary
            onClick={handleGoHome}
            className="w-full justify-center"
          >
            Ir para Consultas
          </ButtonPrimary>

          <button
            onClick={handleGoBack}
            className="w-full px-4 py-2 text-redfemActionPink border border-redfemActionPink rounded-md hover:bg-redfemLightPink transition-colors"
          >
            Voltar à página anterior
          </button>
        </div>

        {/* Informação adicional */}
        <div className="mt-6 text-sm text-gray-500">
          Se você acredita que isso é um erro, entre em contato com o suporte.
        </div>
      </div>
    </div>
  );
}