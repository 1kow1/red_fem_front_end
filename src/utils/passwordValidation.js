// Utilidades para validação de senha

/**
 * Regex para validação de senha complexa
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial (@$!%*?&)
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Valida se a senha atende aos critérios de complexidade
 * @param {string} password - Senha a ser validada
 * @returns {object} - Objeto com resultado da validação e detalhes
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: "Senha é obrigatória",
      details: {}
    };
  }

  const details = {
    hasMinLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password)
  };

  const isValid = Object.values(details).every(Boolean);

  return {
    isValid,
    message: isValid ? "Senha válida" : "Senha não atende aos requisitos",
    details
  };
};

/**
 * Gera mensagem de erro detalhada para senha inválida
 * @param {object} validation - Resultado da validação
 * @returns {string} - Mensagem de erro
 */
export const getPasswordErrorMessage = (validation) => {
  if (validation.isValid) return "";

  const { details } = validation;
  const errors = [];

  if (!details.hasMinLength) errors.push("mínimo de 8 caracteres");
  if (!details.hasLowercase) errors.push("uma letra minúscula");
  if (!details.hasUppercase) errors.push("uma letra maiúscula");
  if (!details.hasNumber) errors.push("um número");
  if (!details.hasSpecialChar) errors.push("um caractere especial (@$!%*?&)");

  return `A senha deve conter: ${errors.join(", ")}`;
};

/**
 * Calcula a força da senha (0-100)
 * @param {string} password - Senha a ser analisada
 * @returns {number} - Força da senha de 0 a 100
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;

  // Comprimento (máximo 30 pontos)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Variedade de caracteres (70 pontos)
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[@$!%*?&]/.test(password)) score += 15;
  if (/[^A-Za-z\d@$!%*?&]/.test(password)) score += 10; // Outros caracteres especiais

  return Math.min(score, 100);
};

/**
 * Retorna a cor baseada na força da senha
 * @param {number} strength - Força da senha (0-100)
 * @returns {string} - Classe CSS ou cor
 */
export const getPasswordStrengthColor = (strength) => {
  if (strength < 30) return "text-red-500";
  if (strength < 60) return "text-yellow-500";
  if (strength < 80) return "text-blue-500";
  return "text-green-500";
};

/**
 * Retorna o texto descritivo da força da senha
 * @param {number} strength - Força da senha (0-100)
 * @returns {string} - Descrição da força
 */
export const getPasswordStrengthText = (strength) => {
  if (strength < 30) return "Muito fraca";
  if (strength < 60) return "Fraca";
  if (strength < 80) return "Boa";
  return "Muito forte";
};