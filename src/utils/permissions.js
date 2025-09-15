// Definição dos cargos disponíveis no sistema
export const CARGOS = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  RECEPCIONISTA: 'RECEPCIONISTA',
  MEDICO: 'MEDICO',
  RESIDENTE: 'RESIDENTE',
  ACADEMICO: 'ACADEMICO'
};

// Configuração de permissões por página
export const PERMISSIONS = {
  usuarios: [CARGOS.ADMINISTRADOR], // Apenas admin pode acessar usuários
  pacientes: [CARGOS.RECEPCIONISTA, CARGOS.MEDICO, CARGOS.RESIDENTE, CARGOS.ACADEMICO, CARGOS.ADMINISTRADOR],
  formularios: [CARGOS.MEDICO, CARGOS.ADMINISTRADOR], // Acadêmico e Recepcionista não podem
  consultas: [
    CARGOS.RECEPCIONISTA,
    CARGOS.MEDICO,
    CARGOS.RESIDENTE,
    CARGOS.ACADEMICO,
    CARGOS.ADMINISTRADOR
  ]
};

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 * @param {string} userCargo - Cargo do usuário
 * @param {string|string[]} requiredRoles - Cargo(s) necessário(s) para acessar
 * @returns {boolean} - True se tem permissão, false caso contrário
 */
export const hasPermission = (userCargo, requiredRoles) => {
  // Administrador sempre tem acesso total
  if (userCargo === CARGOS.ADMINISTRADOR) {
    return true;
  }

  // Se não há cargo definido, negar acesso
  if (!userCargo) {
    return false;
  }

  // Converter para array se for string
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Verificar se o cargo do usuário está na lista de cargos permitidos
  return roles.includes(userCargo);
};

/**
 * Verifica se o usuário pode acessar uma página específica
 * @param {string} userCargo - Cargo do usuário
 * @param {string} page - Nome da página (usuarios, pacientes, formularios, consultas)
 * @returns {boolean} - True se pode acessar, false caso contrário
 */
export const canAccessPage = (userCargo, page) => {
  const allowedRoles = PERMISSIONS[page];

  if (!allowedRoles) {
    console.warn(`Permissões não definidas para a página: ${page}`);
    return false;
  }

  return hasPermission(userCargo, allowedRoles);
};

/**
 * Obter a página inicial padrão baseada no cargo do usuário
 * @param {string} userCargo - Cargo do usuário
 * @returns {string} - Rota da página inicial
 */
export const getDefaultPage = (userCargo) => {
  // Consultas é acessível por todos os cargos
  if (canAccessPage(userCargo, 'consultas')) {
    return '/consultas';
  }

  // Fallback para usuários sem permissões definidas
  return '/consultas';
};

/**
 * Obter lista de páginas que o usuário pode acessar
 * @param {string} userCargo - Cargo do usuário
 * @returns {string[]} - Array com nomes das páginas acessíveis
 */
export const getAccessiblePages = (userCargo) => {
  return Object.keys(PERMISSIONS).filter(page =>
    canAccessPage(userCargo, page)
  );
};

/**
 * Verificar se cargo é válido
 * @param {string} cargo - Cargo a ser verificado
 * @returns {boolean} - True se cargo é válido
 */
export const isValidCargo = (cargo) => {
  return Object.values(CARGOS).includes(cargo);
};

/**
 * Obter label amigável do cargo
 * @param {string} cargo - Cargo do usuário
 * @returns {string} - Label amigável do cargo
 */
export const getCargoLabel = (cargo) => {
  const labels = {
    [CARGOS.ADMINISTRADOR]: 'Administrador',
    [CARGOS.RECEPCIONISTA]: 'Recepcionista',
    [CARGOS.MEDICO]: 'Médico',
    [CARGOS.RESIDENTE]: 'Residente',
    [CARGOS.ACADEMICO]: 'Acadêmico'
  };

  return labels[cargo] || cargo;
};

// Configuração de permissões para componentes específicos
export const COMPONENT_PERMISSIONS = {
  // Sidebar - Botões de navegação
  sidebar: {
    usuarios: [CARGOS.ADMINISTRADOR], // Apenas admin pode ver botão usuários
    formularios: [CARGOS.MEDICO, CARGOS.ADMINISTRADOR], // Recepcionista não pode ver
    pacientes: [CARGOS.RECEPCIONISTA, CARGOS.MEDICO, CARGOS.RESIDENTE, CARGOS.ACADEMICO, CARGOS.ADMINISTRADOR],
    consultas: [CARGOS.RECEPCIONISTA, CARGOS.MEDICO, CARGOS.RESIDENTE, CARGOS.ACADEMICO, CARGOS.ADMINISTRADOR]
  },

  // DetailsPopup - Botões dentro do popup de detalhes da consulta
  detailsPopup: {
    associarFormulario: [CARGOS.MEDICO, CARGOS.RESIDENTE, CARGOS.ACADEMICO, CARGOS.ADMINISTRADOR] // Recepcionista não pode
  },

  // ExecucaoFormulario - Botões na página de execução
  execucaoFormulario: {
    salvarELiberar: [CARGOS.MEDICO, CARGOS.RESIDENTE, CARGOS.ADMINISTRADOR], // Acadêmico não pode liberar
    salvar: [CARGOS.MEDICO, CARGOS.RESIDENTE, CARGOS.ACADEMICO, CARGOS.ADMINISTRADOR] // Todos podem salvar
  }
};

/**
 * Verifica se o usuário pode ver/usar um componente específico
 * @param {string} userCargo - Cargo do usuário
 * @param {string} component - Nome do componente (sidebar, detailsPopup, execucaoFormulario)
 * @param {string} action - Ação específica do componente
 * @returns {boolean} - True se pode usar, false caso contrário
 */
export const canUseComponent = (userCargo, component, action) => {
  // Administrador sempre tem acesso total
  if (userCargo === CARGOS.ADMINISTRADOR) {
    return true;
  }

  // Se não há cargo definido, negar acesso
  if (!userCargo) {
    return false;
  }

  const componentPerms = COMPONENT_PERMISSIONS[component];
  if (!componentPerms) {
    console.warn(`Permissões não definidas para o componente: ${component}`);
    return false;
  }

  const allowedRoles = componentPerms[action];
  if (!allowedRoles) {
    console.warn(`Permissões não definidas para a ação: ${component}.${action}`);
    return false;
  }

  return hasPermission(userCargo, allowedRoles);
};