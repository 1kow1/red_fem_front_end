import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '../../components/Button';
import { useAuth } from '../../contexts/auth';

export default function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    navigate('/consultas');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Ícone de acesso negado */}
        <div className="mb-6">
          <div className="text-6xl font-bold text-red-500 mb-2">🚫</div>
          <div className="w-16 h-1 bg-red-500 mx-auto rounded"></div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acesso Negado
        </h1>

        {/* Mensagem personalizada baseada no usuário */}
        <p className="text-gray-600 mb-6">
          {user?.cargo ? (
            <>
              Seu cargo <strong>{user.cargo}</strong> não possui permissão para acessar este recurso.
              Entre em contato com o administrador se acredita que deveria ter acesso.
            </>
          ) : (
            <>
              Você não possui permissão para acessar este recurso.
              Verifique suas credenciais ou entre em contato com o administrador.
            </>
          )}
        </p>

        {/* Informação sobre permissões */}
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
          <p className="text-sm text-red-700">
            <strong>Precisa de acesso?</strong>
            <br />
            Entre em contato com o administrador do sistema para solicitar as permissões necessárias.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <ButtonPrimary
            onClick={handleGoHome}
            className="w-full"
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

        {/* Usuário logado */}
        {user && (
          <div className="mt-6 text-xs text-gray-400 border-t pt-3">
            Logado como: {user.nome || user.email}
            {user.cargo && ` (${user.cargo})`}
          </div>
        )}
      </div>
    </div>
  );
}