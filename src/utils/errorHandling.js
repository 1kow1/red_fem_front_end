// Utilidades para tratamento de erros do backend

/**
 * Extrai mensagens de erro de validação do backend
 * @param {object} error - Objeto de erro do axios/API
 * @returns {object} - Mensagens de erro organizadas por campo
 */
export const extractValidationErrors = (error) => {
  const validationErrors = {};

  // Verificar se há estrutura de erro esperada
  if (error?.response?.data?.errors) {
    // Formato: { "errors": { "campo": "mensagem" } }
    return error.response.data.errors;
  }

  // Formato alternativo: { "errors": [{ "field": "campo", "message": "mensagem" }] }
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach(err => {
      if (err.field && err.message) {
        validationErrors[err.field] = err.message;
      }
    });
    return validationErrors;
  }

  // Formato com validation details
  if (error?.response?.data?.validationDetails) {
    return error.response.data.validationDetails;
  }

  // Formato ErrorResponse: { "message": "...", "statusCode": 400 }
  if (error?.response?.data?.message && error?.response?.data?.statusCode) {
    return { general: error.response.data.message };
  }

  // Fallback: tentar extrair do message principal
  if (error?.response?.data?.message) {
    return { general: error.response.data.message };
  }

  return {};
};

/**
 * Obtém mensagem de erro geral do backend
 * @param {object} error - Objeto de erro do axios/API
 * @returns {string} - Mensagem de erro
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Erro inesperado. Tente novamente.";
};

/**
 * Verifica se o erro é de validação (status 400)
 * @param {object} error - Objeto de erro do axios/API
 * @returns {boolean} - Se é erro de validação
 */
export const isValidationError = (error) => {
  return error?.response?.status === 400;
};

/**
 * Verifica se o erro é de autenticação (status 401)
 * @param {object} error - Objeto de erro do axios/API
 * @returns {boolean} - Se é erro de autenticação
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401;
};

/**
 * Verifica se o erro é de autorização (status 403)
 * @param {object} error - Objeto de erro do axios/API
 * @returns {boolean} - Se é erro de autorização
 */
export const isForbiddenError = (error) => {
  return error?.response?.status === 403;
};

/**
 * Verifica se o erro é de recurso não encontrado (status 404)
 * @param {object} error - Objeto de erro do axios/API
 * @returns {boolean} - Se é erro de não encontrado
 */
export const isNotFoundError = (error) => {
  return error?.response?.status === 404;
};

/**
 * Verifica se o erro é de servidor (status 5xx)
 * @param {object} error - Objeto de erro do axios/API
 * @returns {boolean} - Se é erro de servidor
 */
export const isServerError = (error) => {
  const status = error?.response?.status;
  return status >= 500 && status < 600;
};

/**
 * Formata erros para exibição em formulários react-hook-form
 * @param {object} validationErrors - Erros de validação extraídos
 * @param {function} setError - Função setError do react-hook-form
 */
export const setFormErrors = (validationErrors, setError) => {
  Object.keys(validationErrors).forEach(field => {
    setError(field, {
      type: "server",
      message: validationErrors[field]
    });
  });
};

/**
 * Mapeia erros de senha para campos específicos
 * @param {object} error - Erro do backend
 * @returns {object} - Erros mapeados por campo
 */
export const mapPasswordErrors = (error) => {
  const errors = {};

  // Primeiro tenta extrair erros de validação normais
  const validationErrors = extractValidationErrors(error);
  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }

  // Se é ErrorResponse, mapear mensagem para campo apropriado
  if (error?.response?.data?.message) {
    const errorMessage = error.response.data.message;

    // Mapear mensagens específicas para campos específicos
    if (errorMessage.includes("Senha atual incorreta") ||
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("senha atual")) {
      errors.senhaAtual = errorMessage;
    } else if (errorMessage.includes("senha deve ter") ||
               errorMessage.includes("password") ||
               errorMessage.includes("complexidade")) {
      errors.novaSenha = errorMessage;
    } else {
      errors.general = errorMessage;
    }
  }

  return errors;
};

/**
 * Hook customizado para tratamento de erros
 * @returns {object} - Funções para tratamento de erro
 */
export const useErrorHandler = () => {
  /**
   * Processa erro e retorna informações organizadas
   * @param {object} error - Erro do backend
   * @returns {object} - Informações do erro
   */
  const handleError = (error) => {
    return {
      isValidation: isValidationError(error),
      isAuth: isAuthError(error),
      isForbidden: isForbiddenError(error),
      isNotFound: isNotFoundError(error),
      isServer: isServerError(error),
      validationErrors: extractValidationErrors(error),
      message: getErrorMessage(error),
      status: error?.response?.status,
      originalError: error
    };
  };

  /**
   * Aplica erros de validação em formulário react-hook-form
   * @param {object} error - Erro do backend
   * @param {function} setError - Função setError do react-hook-form
   * @returns {boolean} - Se conseguiu aplicar os erros
   */
  const applyFormErrors = (error, setError) => {
    if (!isValidationError(error)) {
      return false;
    }

    const validationErrors = extractValidationErrors(error);
    setFormErrors(validationErrors, setError);
    return true;
  };

  return {
    handleError,
    applyFormErrors,
    extractValidationErrors,
    getErrorMessage,
    isValidationError,
    isAuthError,
    isForbiddenError,
    isNotFoundError,
    isServerError
  };
};