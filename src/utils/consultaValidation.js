// Utilidades para validação de consultas

/**
 * Status possíveis de uma consulta
 */
export const CONSULTA_STATUS = {
  PENDENTE: "PENDENTE",
  CANCELADA: "CANCELADA",
  CONCLUIDA: "CONCLUIDA"
};

/**
 * Verifica se uma consulta pode ser cancelada
 * @param {object} consulta - Objeto da consulta
 * @returns {object} - Resultado da validação
 */
export const canCancelConsulta = (consulta) => {
  if (!consulta) {
    return {
      canCancel: false,
      reason: "Consulta não encontrada",
      message: "Consulta não encontrada"
    };
  }

  const status = consulta.status?.toUpperCase();

  if (status === CONSULTA_STATUS.CANCELADA) {
    return {
      canCancel: false,
      reason: "already_cancelled",
      message: "Esta consulta já foi cancelada"
    };
  }

  if (status === CONSULTA_STATUS.CONCLUIDA) {
    return {
      canCancel: false,
      reason: "already_completed",
      message: "Não é possível cancelar uma consulta que já foi concluída"
    };
  }

  // Se está pendente, pode cancelar
  if (status === CONSULTA_STATUS.PENDENTE) {
    return {
      canCancel: true,
      reason: "allowed",
      message: "Consulta pode ser cancelada"
    };
  }

  // Status desconhecido
  return {
    canCancel: false,
    reason: "unknown_status",
    message: "Status da consulta não reconhecido"
  };
};

/**
 * Verifica se uma consulta pode ser editada
 * @param {object} consulta - Objeto da consulta
 * @returns {object} - Resultado da validação
 */
export const canEditConsulta = (consulta) => {
  if (!consulta) {
    return {
      canEdit: false,
      reason: "not_found",
      message: "Consulta não encontrada"
    };
  }

  const status = consulta.status?.toUpperCase();

  if (status === CONSULTA_STATUS.CONCLUIDA) {
    return {
      canEdit: false,
      reason: "completed",
      message: "Consulta já foi concluída e não pode ser editada"
    };
  }

  if (status === CONSULTA_STATUS.CANCELADA) {
    return {
      canEdit: false,
      reason: "cancelled",
      message: "Consulta cancelada não pode ser editada"
    };
  }

  // Se está pendente, pode editar
  return {
    canEdit: true,
    reason: "allowed",
    message: "Consulta pode ser editada"
  };
};

/**
 * Verifica se uma consulta pode ser concluída
 * @param {object} consulta - Objeto da consulta
 * @returns {object} - Resultado da validação
 */
export const canCompleteConsulta = (consulta) => {
  if (!consulta) {
    return {
      canComplete: false,
      reason: "not_found",
      message: "Consulta não encontrada"
    };
  }

  const status = consulta.status?.toUpperCase();

  if (status === CONSULTA_STATUS.CONCLUIDA) {
    return {
      canComplete: false,
      reason: "already_completed",
      message: "Esta consulta já foi concluída"
    };
  }

  if (status === CONSULTA_STATUS.CANCELADA) {
    return {
      canComplete: false,
      reason: "cancelled",
      message: "Consulta cancelada não pode ser concluída"
    };
  }

  // Se está pendente, pode concluir
  return {
    canComplete: true,
    reason: "allowed",
    message: "Consulta pode ser concluída"
  };
};

/**
 * Verifica se uma consulta pode ter formulário associado
 * @param {object} consulta - Objeto da consulta
 * @returns {object} - Resultado da validação
 */
export const canAssociateForm = (consulta) => {
  if (!consulta) {
    return {
      canAssociate: false,
      reason: "not_found",
      message: "Consulta não encontrada"
    };
  }

  const status = consulta.status?.toUpperCase();

  if (status === CONSULTA_STATUS.CANCELADA) {
    return {
      canAssociate: false,
      reason: "cancelled",
      message: "Não é possível vincular formulário a consulta cancelada"
    };
  }

  // Tanto pendente quanto concluída podem ter formulário associado
  return {
    canAssociate: true,
    reason: "allowed",
    message: "Formulário pode ser associado à consulta"
  };
};

/**
 * Retorna as ações disponíveis para uma consulta
 * @param {object} consulta - Objeto da consulta
 * @returns {object} - Ações disponíveis
 */
export const getAvailableActions = (consulta) => {
  return {
    canCancel: canCancelConsulta(consulta),
    canEdit: canEditConsulta(consulta),
    canComplete: canCompleteConsulta(consulta),
    canAssociateForm: canAssociateForm(consulta)
  };
};

/**
 * Retorna a cor do badge baseada no status
 * @param {string} status - Status da consulta
 * @returns {string} - Classe CSS para a cor
 */
export const getStatusBadgeColor = (status) => {
  const statusUpper = status?.toUpperCase();

  switch (statusUpper) {
    case CONSULTA_STATUS.PENDENTE:
      return "bg-yellow-100 text-yellow-800";
    case CONSULTA_STATUS.CANCELADA:
      return "bg-red-100 text-red-800";
    case CONSULTA_STATUS.CONCLUIDA:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Retorna o texto formatado do status
 * @param {string} status - Status da consulta
 * @returns {string} - Status formatado
 */
export const getStatusText = (status) => {
  const statusUpper = status?.toUpperCase();

  switch (statusUpper) {
    case CONSULTA_STATUS.PENDENTE:
      return "Pendente";
    case CONSULTA_STATUS.CANCELADA:
      return "Cancelada";
    case CONSULTA_STATUS.CONCLUIDA:
      return "Concluída";
    default:
      return status || "Status desconhecido";
  }
};

/**
 * Verifica se uma data de consulta já passou
 * @param {string|Date} dataConsulta - Data da consulta
 * @returns {boolean} - Se a data já passou
 */
export const isConsultaOverdue = (dataConsulta) => {
  if (!dataConsulta) return false;

  const consultaDate = new Date(dataConsulta);
  const now = new Date();

  return consultaDate < now;
};

/**
 * Validação completa de uma consulta antes de ação
 * @param {object} consulta - Objeto da consulta
 * @param {string} action - Ação a ser executada
 * @returns {object} - Resultado da validação
 */
export const validateConsultaAction = (consulta, action) => {
  const actions = getAvailableActions(consulta);

  switch (action) {
    case "cancel":
      return actions.canCancel;
    case "edit":
      return actions.canEdit;
    case "complete":
      return actions.canComplete;
    case "associate_form":
      return actions.canAssociateForm;
    default:
      return {
        canPerform: false,
        reason: "unknown_action",
        message: "Ação não reconhecida"
      };
  }
};