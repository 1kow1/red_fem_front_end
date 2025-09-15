import { useAuth } from '../contexts/auth';
import {
  hasPermission,
  canAccessPage,
  getAccessiblePages,
  getCargoLabel,
  CARGOS
} from '../utils/permissions';

/**
 * Hook customizado para gerenciar permissões do usuário
 * @returns {Object} Funções e dados relacionados às permissões
 */
export const usePermissions = () => {
  const { user, userCargo, isAuthenticated, isLoading } = useAuth();

  /**
   * Verifica se o usuário pode acessar determinada página
   * @param {string} page - Nome da página
   * @returns {boolean}
   */
  const canAccess = (page) => {
    if (!isAuthenticated || !userCargo) return false;
    return canAccessPage(userCargo, page);
  };

  /**
   * Verifica se o usuário tem determinado cargo ou permissão
   * @param {string|string[]} requiredRoles - Cargo(s) necessário(s)
   * @returns {boolean}
   */
  const hasRole = (requiredRoles) => {
    if (!isAuthenticated || !userCargo) return false;
    return hasPermission(userCargo, requiredRoles);
  };

  /**
   * Verifica se o usuário é administrador
   * @returns {boolean}
   */
  const isAdmin = () => {
    return userCargo === CARGOS.ADMINISTRADOR;
  };

  /**
   * Verifica se o usuário é médico
   * @returns {boolean}
   */
  const isMedico = () => {
    return userCargo === CARGOS.MEDICO;
  };

  /**
   * Verifica se o usuário é recepcionista
   * @returns {boolean}
   */
  const isRecepcionista = () => {
    return userCargo === CARGOS.RECEPCIONISTA;
  };

  /**
   * Verifica se o usuário é residente
   * @returns {boolean}
   */
  const isResidente = () => {
    return userCargo === CARGOS.RESIDENTE;
  };

  /**
   * Verifica se o usuário é acadêmico
   * @returns {boolean}
   */
  const isAcademico = () => {
    return userCargo === CARGOS.ACADEMICO;
  };

  /**
   * Obtém as páginas que o usuário pode acessar
   * @returns {string[]}
   */
  const accessiblePages = () => {
    if (!isAuthenticated || !userCargo) return [];
    return getAccessiblePages(userCargo);
  };

  /**
   * Obtém o label amigável do cargo do usuário
   * @returns {string}
   */
  const cargoLabel = () => {
    if (!userCargo) return 'Sem cargo';
    return getCargoLabel(userCargo);
  };

  return {
    // Estados
    userCargo,
    cargoLabel: cargoLabel(),
    isAuthenticated,
    isLoading,
    user,

    // Verificações de permissão
    canAccess,
    hasRole,
    accessiblePages: accessiblePages(),

    // Verificações específicas de cargo
    isAdmin: isAdmin(),
    isMedico: isMedico(),
    isRecepcionista: isRecepcionista(),
    isResidente: isResidente(),
    isAcademico: isAcademico(),

    // Funcões utilitárias
    canAccessUsers: canAccess('usuarios'),
    canAccessPatients: canAccess('pacientes'),
    canAccessForms: canAccess('formularios'),
    canAccessConsultas: canAccess('consultas')
  };
};