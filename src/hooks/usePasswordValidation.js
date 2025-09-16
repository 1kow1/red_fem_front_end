import { useState, useEffect } from 'react';
import { validatePassword, PASSWORD_REGEX } from '../utils/passwordValidation';

/**
 * Hook customizado para validação de senha
 * @param {string} password - Senha a ser validada
 * @param {object} options - Opções de configuração
 * @returns {object} - Estado e funções de validação
 */
export const usePasswordValidation = (password = "", options = {}) => {
  const {
    validateOnChange = true,
    debounceMs = 300
  } = options;

  const [validation, setValidation] = useState({
    isValid: false,
    message: "",
    details: {}
  });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!validateOnChange || !password) {
      setValidation({
        isValid: false,
        message: "",
        details: {}
      });
      return;
    }

    setIsValidating(true);

    const timeoutId = setTimeout(() => {
      const result = validatePassword(password);
      setValidation(result);
      setIsValidating(false);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      setIsValidating(false);
    };
  }, [password, validateOnChange, debounceMs]);

  /**
   * Valida senha manualmente
   * @param {string} passwordToValidate - Senha a ser validada
   * @returns {object} - Resultado da validação
   */
  const validateManually = (passwordToValidate = password) => {
    const result = validatePassword(passwordToValidate);
    setValidation(result);
    return result;
  };

  /**
   * Retorna se a senha é válida segundo o regex
   * @param {string} passwordToCheck - Senha a verificar
   * @returns {boolean} - Se a senha é válida
   */
  const isPasswordValid = (passwordToCheck = password) => {
    return PASSWORD_REGEX.test(passwordToCheck);
  };

  /**
   * Limpa o estado de validação
   */
  const clearValidation = () => {
    setValidation({
      isValid: false,
      message: "",
      details: {}
    });
  };

  return {
    validation,
    isValidating,
    validateManually,
    isPasswordValid,
    clearValidation,
    // Helpers
    hasMinLength: validation.details.hasMinLength || false,
    hasLowercase: validation.details.hasLowercase || false,
    hasUppercase: validation.details.hasUppercase || false,
    hasNumber: validation.details.hasNumber || false,
    hasSpecialChar: validation.details.hasSpecialChar || false
  };
};