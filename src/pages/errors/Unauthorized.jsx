import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '../../components/Button';
import { useAuth } from '../../contexts/auth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogin = async () => {
    await logout(); // Limpar sessão atual
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/consultas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Ícone de sessão expirada */}
        <div className="mb-6">
          <div className="text-6xl font-bold text-orange-500 mb-2">⏱️</div>
          <div className="w-16 h-1 bg-orange-500 mx-auto rounded"></div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sessão Expirada
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Sua sessão expirou por motivos de segurança.
          Faça login novamente para continuar usando o sistema.
        </p>

        {/* Informação de segurança */}
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-6">
          <p className="text-sm text-orange-700">
            <strong>Por sua segurança</strong>
            <br />
            As sessões expiram automaticamente após um período de inatividade.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <ButtonPrimary
            onClick={handleLogin}
            className="w-full"
          >
            Fazer Login Novamente
          </ButtonPrimary>

          <button
            onClick={handleGoHome}
            className="w-full px-4 py-2 text-redfemActionPink border border-redfemActionPink rounded-md hover:bg-redfemLightPink transition-colors"
          >
            Tentar continuar
          </button>
        </div>

        {/* Dica adicional */}
        <div className="mt-6 text-sm text-gray-500">
          Dica: Mantenha-se ativo no sistema para evitar que a sessão expire.
        </div>
      </div>
    </div>
  );
}