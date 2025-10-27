// Utilidades para validação de idade

/**
 * Calcula a idade em anos com base na data de nascimento
 * @param {string|Date} birthDate - Data de nascimento
 * @returns {number} - Idade em anos
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const today = new Date();

  // Verificar se a data é válida
  if (isNaN(birth.getTime())) return 0;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Ajustar se ainda não fez aniversário este ano
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Valida se a idade está dentro dos limites permitidos
 * @param {string|Date} birthDate - Data de nascimento
 * @param {object} options - Opções de validação
 * @returns {object} - Resultado da validação
 */
export const validateAge = (birthDate, options = {}) => {
  const {
    maxAge = 120,
    minAge = 0,
    allowFuture = false
  } = options;

  if (!birthDate) {
    return {
      isValid: false,
      message: "Data de nascimento é obrigatória",
      age: 0,
      errors: ["required"]
    };
  }

  const birth = new Date(birthDate);
  const today = new Date();
  const errors = [];

  // Verificar se a data é válida
  if (isNaN(birth.getTime())) {
    return {
      isValid: false,
      message: "Data de nascimento inválida",
      age: 0,
      errors: ["invalid_date"]
    };
  }

  // Verificar se não está no futuro
  if (!allowFuture && birth > today) {
    errors.push("future_date");
  }

  const age = calculateAge(birthDate);

  // Verificar idade mínima
  if (age < minAge) {
    errors.push("too_young");
  }

  // Verificar idade máxima
  if (age > maxAge) {
    errors.push("too_old");
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    message: isValid ? "Idade válida" : getAgeErrorMessage(errors, { age, maxAge, minAge }),
    age,
    errors
  };
};

/**
 * Gera mensagem de erro baseada nos tipos de erro
 * @param {string[]} errors - Lista de erros
 * @param {object} context - Contexto com informações da validação
 * @returns {string} - Mensagem de erro
 */
const getAgeErrorMessage = (errors, context) => {
  const { age, maxAge, minAge } = context;

  if (errors.includes("invalid_date")) {
    return "Data de nascimento inválida";
  }

  if (errors.includes("future_date")) {
    return "Data de nascimento não pode ser no futuro";
  }

  if (errors.includes("too_old")) {
    return `Idade não pode ser superior a ${maxAge} anos (idade calculada: ${age} anos)`;
  }

  if (errors.includes("too_young")) {
    return `Idade não pode ser inferior a ${minAge} anos`;
  }

  return "Data de nascimento inválida";
};

/**
 * Valida especificamente para pacientes (máximo 120 anos)
 * @param {string|Date} birthDate - Data de nascimento
 * @returns {object} - Resultado da validação
 */
export const validatePatientAge = (birthDate) => {
  return validateAge(birthDate, {
    maxAge: 120,
    minAge: 0,
    allowFuture: false
  });
};

/**
 * Formata a idade para exibição
 * @param {number} age - Idade em anos
 * @returns {string} - Idade formatada
 */
export const formatAge = (age) => {
  if (age === 0) return "Recém-nascido";
  if (age === 1) return "1 ano";
  return `${age} anos`;
};

/**
 * Calcula a data de nascimento baseada na idade
 * @param {number} age - Idade desejada
 * @returns {Date} - Data de nascimento aproximada
 */
export const calculateBirthDateFromAge = (age) => {
  const today = new Date();
  return new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
};

/**
 * Verifica se uma pessoa é maior de idade
 * @param {string|Date} birthDate - Data de nascimento
 * @param {number} adultAge - Idade para ser considerado adulto (padrão: 18)
 * @returns {boolean} - Se é maior de idade
 */
export const isAdult = (birthDate, adultAge = 18) => {
  const age = calculateAge(birthDate);
  return age >= adultAge;
};

/**
 * Verifica se uma pessoa é idosa
 * @param {string|Date} birthDate - Data de nascimento
 * @param {number} elderlyAge - Idade para ser considerado idoso (padrão: 65)
 * @returns {boolean} - Se é idoso
 */
export const isElderly = (birthDate, elderlyAge = 65) => {
  const age = calculateAge(birthDate);
  return age >= elderlyAge;
};