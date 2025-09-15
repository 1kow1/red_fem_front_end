import { useAuth } from '../contexts/auth/useAuth';
import { canUseComponent, canAccessPage, hasPermission } from '../utils/permissions';

/**
 * Hook customizado para verificar permissões baseadas em roles
 * @returns {Object} Funções de verificação de permissões
 */
export const useRolePermissions = () => {
  const { user } = useAuth();
  const userCargo = user?.cargo;

  return {
    /**
     * Verifica se pode usar um componente específico
     * @param {string} component - Nome do componente
     * @param {string} action - Ação específica do componente
     * @returns {boolean}
     */
    canUseComponent: (component, action) => canUseComponent(userCargo, component, action),

    /**
     * Verifica se pode acessar uma página
     * @param {string} page - Nome da página
     * @returns {boolean}
     */
    canAccessPage: (page) => canAccessPage(userCargo, page),

    /**
     * Verifica permissão genérica
     * @param {string|string[]} requiredRoles - Roles necessárias
     * @returns {boolean}
     */
    hasPermission: (requiredRoles) => hasPermission(userCargo, requiredRoles),

    /**
     * Cargo do usuário atual
     */
    userCargo,

    /**
     * Dados do usuário
     */
    user,

    /**
     * Verificações específicas para conveniência
     */
    permissions: {
      // Sidebar
      canSeeUsuarios: canUseComponent(userCargo, 'sidebar', 'usuarios'),
      canSeeFormularios: canUseComponent(userCargo, 'sidebar', 'formularios'),

      // Execução Formulário
      canSaveAndRelease: canUseComponent(userCargo, 'execucaoFormulario', 'salvarELiberar'),

      // Details Popup
      canAssociateForm: canUseComponent(userCargo, 'detailsPopup', 'associarFormulario'),

      // Páginas
      canAccessUsuarios: canAccessPage(userCargo, 'usuarios'),
      canAccessFormularios: canAccessPage(userCargo, 'formularios'),
    }
  };
};