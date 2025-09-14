export const ERROR_MESSAGES = {
  // Autenticação
  'Invalid credentials: Invalid password': 'Email ou senha incorretos',
  'User not authenticated': 'Sessão expirada. Faça login novamente',
  'Invalid or expired reset token': 'Link de redefinição inválido ou expirado',
  'Token has expired or already been used': 'Este link já foi utilizado',

  // Usuários
  'Email already exists': 'Este email já está sendo usado',
  'CRM already exist.': 'Este CRM já está cadastrado',
  'User not found': 'Usuário não encontrado',
  'Especialidade cannot be null': 'Especialidade é obrigatória para médicos',
  'Crm cannot be null': 'CRM é obrigatório para médicos',
  'Specialty does not exist': 'Especialidade inválida',
  'Cargo does not exist': 'Tipo de usuário inválido',

  // Pacientes
  'Patient not found': 'Paciente não encontrado',
  'Patient already exists': 'Paciente já cadastrado',

  // Formulários
  'Form not found': 'Formulário não encontrado',
  'Illegal operation on form': 'Operação não permitida neste formulário',

  // Consultas
  'Consultation not found': 'Consulta não encontrada',

  // Execuções
  'Form execution not found': 'Execução de formulário não encontrada',
  'Operation not allowed': 'Operação não permitida',

  // Servidor
  'Error sending reset email': 'Erro ao enviar email. Tente novamente',
  'An unexpected error occurred': 'Erro interno do servidor. Tente novamente',

  // Reset de senha
  'Password reset email sent successfully': 'E-mail de recuperação enviado com sucesso',
  'Password reset successfully': 'Senha alterada com sucesso',
  'Token is valid': 'Token válido'
};

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    const serverMessage = error.response.data.message;

    // Procura por mensagem específica
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (serverMessage.includes(key)) {
        return value;
      }
    }

    // Se não encontrou, usa mensagem genérica baseada no status
    return getGenericErrorByStatus(error.response.status);
  }

  return 'Erro de conexão. Verifique sua internet';
};

export const getGenericErrorByStatus = (status) => {
  switch (status) {
    case 400: return 'Dados inválidos. Verifique as informações';
    case 401: return 'Acesso não autorizado. Faça login novamente';
    case 403: return 'Você não tem permissão para esta ação';
    case 404: return 'Recurso não encontrado';
    case 409: return 'Dados já existem no sistema';
    case 500: return 'Erro interno do servidor. Tente novamente';
    default: return 'Erro inesperado. Tente novamente';
  }
};

export const handleValidationErrors = (errors) => {
  const fieldMessages = {
    'nome': 'Nome',
    'email': 'Email',
    'senha': 'Senha',
    'telefone': 'Telefone',
    'crm': 'CRM',
    'especialidade': 'Especialidade'
  };

  const translatedErrors = {};

  for (const [field, message] of Object.entries(errors)) {
    const fieldName = fieldMessages[field] || field;

    if (message.includes('mandatory')) {
      translatedErrors[field] = `${fieldName} é obrigatório`;
    } else if (message.includes('Invalid e-mail')) {
      translatedErrors[field] = 'Email inválido';
    } else if (message.includes('at least 6 characters')) {
      translatedErrors[field] = 'Senha deve ter pelo menos 6 caracteres';
    } else if (message.includes('Invalid phone format')) {
      translatedErrors[field] = 'Formato de telefone inválido';
    } else {
      translatedErrors[field] = message;
    }
  }

  return translatedErrors;
};

export const handleApiError = (error) => {
  if (error?.response) {
    const { status, data } = error.response;

    // Erros de validação (400 com errors object)
    if (status === 400 && data.errors) {
      const translatedErrors = handleValidationErrors(data.errors);
      return {
        type: 'validation',
        errors: translatedErrors,
        message: 'Corrija os erros nos campos destacados'
      };
    }

    // Outros erros com mensagem traduzida
    return {
      type: 'general',
      message: getErrorMessage(error),
      status: status
    };
  }

  return {
    type: 'network',
    message: 'Erro de conexão. Verifique sua internet'
  };
};