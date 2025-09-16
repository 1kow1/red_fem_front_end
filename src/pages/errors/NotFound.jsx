import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ButtonPrimary } from '../../components/Button';
import { useAuth } from '../../contexts/auth';
import { getDefaultPage, getAccessiblePages } from '../../utils/permissions';

export default function NotFound() {
  const navigate = useNavigate();
  const { userCargo, isAuthenticated, isLoading } = useAuth();

  // Auto-redirecionar para uma página segura depois de um tempo
  useEffect(() => {
    if (!isLoading && isAuthenticated && userCargo) {
      const timer = setTimeout(() => {
        const safePage = getDefaultPage(userCargo);
        navigate(safePage, { replace: true });
      }, 5000); // Redireciona automaticamente após 5 segundos

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, userCargo, navigate]);

  const handleGoHome = () => {
    if (!userCargo) {
      navigate('/login');
      return;
    }
    const safePage = getDefaultPage(userCargo);
    navigate(safePage);
  };

  const handleGoSafe = () => {
    if (!userCargo) {
      navigate('/login');
      return;
    }

    // Encontrar a primeira página acessível
    const accessiblePages = getAccessiblePages(userCargo);
    if (accessiblePages.length > 0) {
      navigate(`/${accessiblePages[0]}`);
    } else {
      navigate('/login');
    }
  };

  // Se não está autenticado, redirecionar para login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
        <p className="text-gray-600 mb-4">
          Oops! A página que você está procurando não foi encontrada ou você não tem permissão para acessá-la.
        </p>

        {userCargo && (
          <p className="text-sm text-gray-500 mb-6">
            Você será redirecionado automaticamente para uma página segura em 5 segundos.
          </p>
        )}

        {/* Botões de ação */}
        <div className="space-y-3">
          <ButtonPrimary
            onClick={handleGoHome}
            className="w-full justify-center"
          >
            {userCargo ? 'Ir para Página Inicial' : 'Fazer Login'}
          </ButtonPrimary>

          {userCargo && (
            <button
              onClick={handleGoSafe}
              className="w-full px-4 py-2 text-redfemActionPink border border-redfemActionPink rounded-md hover:bg-redfemLightPink transition-colors"
            >
              Ir para Página Segura
            </button>
          )}
        </div>

        {/* Informação adicional */}
        <div className="mt-6 text-sm text-gray-500">
          Se você acredita que isso é um erro, entre em contato com o suporte.
        </div>
      </div>
    </div>
  );
}