import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { hasPermission } from '../utils/permissions';

/**
 * Componente para proteger rotas baseado no cargo do usuário
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a ser renderizado se tem permissão
 * @param {string|string[]} props.allowedRoles - Cargo(s) permitido(s) para acessar
 * @param {string} props.redirectTo - Rota para redirecionar se não tem permissão (padrão: /forbidden)
 * @param {string} props.fallbackPage - Página alternativa se não tem acesso (padrão: /consultas)
 */
export default function RoleProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/not-found',
  fallbackPage = '/consultas'
}) {
  const { isAuthenticated, isLoading, userCargo, user } = useAuth();

  // Ainda carregando autenticação
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-redfemActionPink"></div>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permissões
  const hasRequiredPermission = hasPermission(userCargo, allowedRoles);

  if (!hasRequiredPermission) {
    // Log da tentativa de acesso não autorizado
    console.warn('Tentativa de acesso não autorizado:', {
      user: user?.nome || user?.email,
      cargo: userCargo,
      allowedRoles,
      timestamp: new Date().toISOString()
    });

    // Redirecionar para NotFound conforme solicitado
    return <Navigate to={redirectTo} replace />;

    return <Navigate to={fallbackPage} replace />;
  }

  // Usuário tem permissão, renderizar conteúdo
  return children;
}

/**
 * Hook para verificar permissões em componentes
 * @param {string|string[]} allowedRoles - Cargo(s) permitido(s)
 * @returns {Object} - { hasAccess: boolean, userCargo: string, isLoading: boolean }
 */
export const useRoleCheck = (allowedRoles) => {
  const { userCargo, isLoading, isAuthenticated } = useAuth();

  return {
    hasAccess: isAuthenticated && hasPermission(userCargo, allowedRoles),
    userCargo,
    isLoading,
    isAuthenticated
  };
};