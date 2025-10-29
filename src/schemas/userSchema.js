import * as yup from "yup";

// Schema para validação de usuário
export const userSchema = yup.object().shape({
  nome: yup.string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  email: yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),

  telefone: yup.string()
    .matches(/^\d{11}$/, "Telefone deve ter exatamente 11 dígitos numéricos")
    .required("Telefone é obrigatório"),

  cargo: yup.string()
    .required("Cargo é obrigatório")
    .oneOf(
      ['RECEPCIONISTA', 'MEDICO', 'RESIDENTE', 'ACADEMICO'],
      'Cargo inválido'
    ),

  especialidade: yup.string()
    .nullable()
    .when("cargo", {
      is: (cargo) => ["MEDICO", "RESIDENTE"].includes(cargo),
      then: (schema) => schema
        .required("Especialidade é obrigatória")
        .oneOf(
          ['GINECOLOGIA', 'ONCOLOGIA', 'ODONTOLOGIA'],
          'Especialidade inválida'
        ),
    }),

  crm: yup.string()
    .nullable()
    .when("cargo", {
      is: (cargo) => ["MEDICO", "RESIDENTE"].includes(cargo),
      then: (schema) =>
        schema
          .required("CRM é obrigatório")
          .matches(
            /^CRM\/[A-Z]{2}\s\d{6}$/,
            "CRM deve estar no formato: CRM/PR 123456"
          ),
    }),

  ativo: yup.boolean().default(true),
});

// Schema para edição de usuário (permite alguns campos serem opcionais)
export const userEditSchema = yup.object().shape({
  id: yup.string().required("ID do usuário é obrigatório para edição"),

  nome: yup.string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  email: yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),

  telefone: yup.string()
    .matches(/^\d{11}$/, "Telefone deve ter exatamente 11 dígitos numéricos")
    .required("Telefone é obrigatório"),

  // Campos não editáveis em alguns contextos
  cargo: yup.string().oneOf(
    ['RECEPCIONISTA', 'MEDICO', 'RESIDENTE', 'ACADEMICO'],
    'Cargo inválido'
  ),

  especialidade: yup.string().oneOf(
    ['GINECOLOGIA', 'ONCOLOGIA', 'ODONTOLOGIA', ''],
    'Especialidade inválida'
  ).nullable(),

  crm: yup.string().nullable(),
  ativo: yup.boolean(),
});

// Constantes para uso nos componentes
export const CARGOS = [
  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'RESIDENTE', label: 'Residente' },
  { value: 'ACADEMICO', label: 'Acadêmico' }
];

export const ESPECIALIDADES = [
  { value: 'GINECOLOGIA', label: 'Ginecologia' },
  { value: 'ONCOLOGIA', label: 'Oncologia' },
  { value: 'ODONTOLOGIA', label: 'Odontologia' }
];

// Função utilitária para validar usuário
export const validateUser = async (data, isEdit = false) => {
  try {
    const schema = isEdit ? userEditSchema : userSchema;
    const validData = await schema.validate(data, { abortEarly: false });
    return { isValid: true, data: validData, errors: null };
  } catch (error) {
    if (error.inner) {
      // Yup ValidationError
      const errors = error.inner.reduce((acc, err) => {
        acc[err.path] = err.message;
        return acc;
      }, {});
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: { general: error.message } };
  }
};

// Função para formatar dados antes da validação
export const prepareUserForValidation = (formData) => {
  return {
    ...formData,
    ativo: formData.ativo !== false, // Default true se não especificado
    // Limpar especialidade e CRM se não forem necessários
    especialidade: ['MEDICO', 'RESIDENTE'].includes(formData.cargo) ? formData.especialidade : null,
    crm: ['MEDICO', 'RESIDENTE'].includes(formData.cargo) ? formData.crm : null,
  };
};