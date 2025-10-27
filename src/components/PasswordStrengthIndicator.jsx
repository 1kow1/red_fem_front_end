import React from 'react';
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  validatePassword,
  getPasswordErrorMessage
} from '../utils/passwordValidation';

/**
 * Componente que exibe indicador visual da força da senha
 * @param {string} password - Senha atual
 * @param {boolean} showValidation - Se deve mostrar detalhes de validação
 * @param {string} className - Classes CSS adicionais
 */
const PasswordStrengthIndicator = ({
  password = "",
  showValidation = true,
  className = ""
}) => {
  const strength = calculatePasswordStrength(password);
  const strengthColor = getPasswordStrengthColor(strength);
  const strengthText = getPasswordStrengthText(strength);
  const validation = validatePassword(password);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      {/* Barra de força */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength < 30 ? 'bg-red-500' :
            strength < 60 ? 'bg-yellow-500' :
            strength < 80 ? 'bg-blue-500' : 'bg-green-500'
          }`}
          style={{ width: `${strength}%` }}
        />
      </div>

      {/* Texto da força */}
      <div className={`text-sm font-medium ${strengthColor}`}>
        Força: {strengthText} ({strength}%)
      </div>

      {/* Validação detalhada */}
      {showValidation && (
        <div className="mt-2 space-y-1">
          {!validation.isValid && (
            <div className="text-red-500 text-sm">
              {getPasswordErrorMessage(validation)}
            </div>
          )}

          {validation.isValid && (
            <div className="text-green-500 text-sm">
              ✓ Senha atende a todos os requisitos
            </div>
          )}

          {/* Lista de requisitos */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className={validation.details.hasMinLength ? 'text-green-600' : 'text-red-600'}>
              {validation.details.hasMinLength ? '✓' : '✗'} Mínimo 8 caracteres
            </div>
            <div className={validation.details.hasLowercase ? 'text-green-600' : 'text-red-600'}>
              {validation.details.hasLowercase ? '✓' : '✗'} Uma letra minúscula
            </div>
            <div className={validation.details.hasUppercase ? 'text-green-600' : 'text-red-600'}>
              {validation.details.hasUppercase ? '✓' : '✗'} Uma letra maiúscula
            </div>
            <div className={validation.details.hasNumber ? 'text-green-600' : 'text-red-600'}>
              {validation.details.hasNumber ? '✓' : '✗'} Um número
            </div>
            <div className={validation.details.hasSpecialChar ? 'text-green-600' : 'text-red-600'}>
              {validation.details.hasSpecialChar ? '✓' : '✗'} Um caractere especial (@$!%*?&)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;