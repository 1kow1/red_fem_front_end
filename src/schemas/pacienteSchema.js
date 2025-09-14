import * as yup from "yup";

// Schema para validação de paciente
export const pacienteSchema = yup.object().shape({
  nome: yup.string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  email: yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),

  telefone: yup.string()
    .matches(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos numéricos")
    .required("Telefone é obrigatório"),

  cpf: yup.string()
    .matches(/^\d{11}$/, "CPF deve ter 11 dígitos numéricos")
    .required("CPF é obrigatório"),

  dataDeNascimento: yup.date()
    .required("Data de nascimento é obrigatória")
    .max(new Date(), "Data de nascimento não pode ser no futuro")
    .typeError("Data de nascimento inválida"),

  sexo: yup.string()
    .oneOf(["M", "F"], "Sexo deve ser M (Masculino) ou F (Feminino)")
    .required("Sexo é obrigatório"),

  estadoCivil: yup.string()
    .oneOf(
      ["SOLTEIRO", "SOLTEIRA", "CASADO", "CASADA", "DIVORCIADO", "DIVORCIADA", "VIÚVO", "VIÚVA"],
      "Estado civil inválido"
    )
    .required("Estado civil é obrigatório"),

  profissao: yup.string()
    .nullable()
    .max(100, "Profissão deve ter no máximo 100 caracteres"),

  cidade: yup.string()
    .required("Cidade é obrigatória")
    .max(100, "Cidade deve ter no máximo 100 caracteres"),

  uf: yup.string()
    .length(2, "UF deve ter 2 caracteres")
    .matches(/^[A-Z]{2}$/, "UF deve ser em letras maiúsculas")
    .required("UF é obrigatória"),

  ativo: yup.boolean().default(true),
});

// Schema para edição de paciente
export const pacienteEditSchema = yup.object().shape({
  id: yup.string().required("ID do paciente é obrigatório para edição"),

  nome: yup.string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  email: yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),

  telefone: yup.string()
    .matches(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos numéricos")
    .required("Telefone é obrigatório"),

  cpf: yup.string()
    .matches(/^\d{11}$/, "CPF deve ter 11 dígitos numéricos")
    .required("CPF é obrigatório"),

  dataDeNascimento: yup.date()
    .required("Data de nascimento é obrigatória")
    .max(new Date(), "Data de nascimento não pode ser no futuro")
    .typeError("Data de nascimento inválida"),

  sexo: yup.string()
    .oneOf(["M", "F"], "Sexo deve ser M (Masculino) ou F (Feminino)")
    .required("Sexo é obrigatório"),

  estadoCivil: yup.string()
    .oneOf(
      ["SOLTEIRO", "SOLTEIRA", "CASADO", "CASADA", "DIVORCIADO", "DIVORCIADA", "VIÚVO", "VIÚVA"],
      "Estado civil inválido"
    )
    .required("Estado civil é obrigatório"),

  profissao: yup.string()
    .nullable()
    .max(100, "Profissão deve ter no máximo 100 caracteres"),

  cidade: yup.string()
    .required("Cidade é obrigatória")
    .max(100, "Cidade deve ter no máximo 100 caracteres"),

  uf: yup.string()
    .length(2, "UF deve ter 2 caracteres")
    .matches(/^[A-Z]{2}$/, "UF deve ser em letras maiúsculas")
    .required("UF é obrigatória"),

  ativo: yup.boolean(),
});

// Constantes para uso nos componentes
export const SEXOS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' }
];

export const ESTADOS_CIVIS = [
  { value: 'CASADA', label: 'Casada' },
  { value: 'CASADO', label: 'Casado' },
  { value: 'DIVORCIADA', label: 'Divorciada' },
  { value: 'DIVORCIADO', label: 'Divorciado' },
  { value: 'SOLTEIRA', label: 'Solteira' },
  { value: 'SOLTEIRO', label: 'Solteiro' },
  { value: 'VIÚVA', label: 'Viúva' },
  { value: 'VIÚVO', label: 'Viúvo' },
];

export const ESTADOS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" }
];

// Função utilitária para validar paciente
export const validatePaciente = async (data, isEdit = false) => {
  try {
    const schema = isEdit ? pacienteEditSchema : pacienteSchema;
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
export const preparePacienteForValidation = (formData) => {
  return {
    ...formData,
    ativo: formData.ativo !== false, // Default true se não especificado
    dataDeNascimento: formData.dataDeNascimento ? new Date(formData.dataDeNascimento) : null,
    uf: formData.uf ? formData.uf.toUpperCase() : formData.uf,
  };
};

// Função para validar CPF (algoritmo)
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, ''); // Remove caracteres não numéricos

  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Schema com validação avançada de CPF
export const pacienteSchemaWithCPFValidation = yup.object().shape({
  ...pacienteSchema.fields,
  cpf: yup.string()
    .required("CPF é obrigatório")
    .test("cpf-valid", "CPF inválido", function(value) {
      if (!value) return false;
      return validateCPF(value);
    }),
});