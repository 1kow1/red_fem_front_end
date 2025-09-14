import * as yup from 'yup';

// Schema para validação de consulta
export const consultaSchema = yup.object().shape({
  // Campos obrigatórios
  patientId: yup
    .string()
    .required('Paciente é obrigatório')
    .min(1, 'Selecione um paciente'),

  medicoId: yup
    .string()
    .required('Médico é obrigatório')
    .min(1, 'Selecione um médico'),

  dataConsulta: yup
    .date()
    .required('Data da consulta é obrigatória')
    .min(new Date().setHours(0, 0, 0, 0), 'Data não pode ser anterior a hoje')
    .typeError('Data inválida'),

  horario: yup
    .string()
    .required('Horário é obrigatório')
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Formato de horário inválido (HH:MM)'
    ),

  tipoConsulta: yup
    .string()
    .required('Tipo de consulta é obrigatório')
    .oneOf(
      ['CONSULTA', 'RETORNO', 'URGENCIA', 'EXAME'],
      'Tipo de consulta inválido'
    ),

  // Campos opcionais
  status: yup
    .string()
    .oneOf(
      ['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'FALTOU'],
      'Status inválido'
    )
    .default('AGENDADA'),

  ativo: yup
    .boolean()
    .default(true),

  // Validação condicional para execução de formulário (se fornecida)
  execucaoFormulario: yup.object().shape({
    formularioId: yup
      .string()
      .when('$hasFormulario', {
        is: true,
        then: (schema) => schema.required('Formulário é obrigatório quando execução é informada'),
        otherwise: (schema) => schema.nullable()
      }),

    respostas: yup
      .array()
      .of(
        yup.object().shape({
          perguntaId: yup.string().required(),
          resposta: yup.mixed().required()
        })
      )
      .default([]),

    isSalvo: yup
      .boolean()
      .default(false),

    isLiberado: yup
      .boolean()
      .default(false),
  }).nullable().default(null),

  // Validação da combinação data + horário
}).test(
  'data-horario-futura',
  'Data e horário devem ser no futuro',
  function(value) {
    const { dataConsulta, horario } = value;

    if (!dataConsulta || !horario) {
      return true; // Deixa a validação individual cuidar dos obrigatórios
    }

    try {
      const [hora, minuto] = horario.split(':');
      const dataHoraCombinada = new Date(dataConsulta);
      dataHoraCombinada.setHours(parseInt(hora), parseInt(minuto), 0, 0);

      const agora = new Date();

      if (dataHoraCombinada <= agora) {
        return this.createError({
          path: 'horario',
          message: 'Horário deve ser no futuro'
        });
      }

      return true;
    } catch {
      return this.createError({
        path: 'horario',
        message: 'Erro ao validar data e horário'
      });
    }
  }
);

// Schema para edição (permite alguns campos serem opcionais)
export const consultaEditSchema = yup.object().shape({
  id: yup
    .string()
    .required('ID da consulta é obrigatório para edição'),

  patientId: yup
    .string()
    .required('Paciente é obrigatório'),

  medicoId: yup
    .string()
    .required('Médico é obrigatório'),

  dataConsulta: yup
    .date()
    .required('Data da consulta é obrigatória')
    .typeError('Data inválida'),

  horario: yup
    .string()
    .required('Horário é obrigatório')
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Formato de horário inválido (HH:MM)'
    ),

  tipoConsulta: yup
    .string()
    .required('Tipo de consulta é obrigatório')
    .oneOf(
      ['CONSULTA', 'RETORNO', 'URGENCIA', 'EXAME'],
      'Tipo de consulta inválido'
    ),

  status: yup
    .string()
    .oneOf(
      ['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'FALTOU'],
      'Status inválido'
    ),

  ativo: yup.boolean(),

  execucaoFormulario: yup.object().shape({
    id: yup.string().nullable(),
    formularioId: yup.string().nullable(),
    respostas: yup.array().default([]),
    isSalvo: yup.boolean().default(false),
    isLiberado: yup.boolean().default(false),
  }).nullable().default(null),
});

// Schema para filtros de busca
export const consultaFilterSchema = yup.object().shape({
  dataInicio: yup
    .date()
    .typeError('Data de início inválida')
    .nullable(),

  dataFim: yup
    .date()
    .typeError('Data de fim inválida')
    .min(yup.ref('dataInicio'), 'Data de fim deve ser posterior à data de início')
    .nullable(),

  medicoId: yup
    .string()
    .nullable(),

  patientId: yup
    .string()
    .nullable(),

  status: yup
    .string()
    .oneOf(
      ['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'FALTOU', ''],
      'Status inválido'
    )
    .nullable(),

  tipoConsulta: yup
    .string()
    .oneOf(
      ['CONSULTA', 'RETORNO', 'URGENCIA', 'EXAME', ''],
      'Tipo de consulta inválido'
    )
    .nullable(),

  page: yup
    .number()
    .min(0, 'Página deve ser maior que 0')
    .default(0),

  size: yup
    .number()
    .min(1, 'Tamanho deve ser maior que 0')
    .max(100, 'Tamanho máximo é 100')
    .default(10),
});

// Constantes para uso nos componentes
export const TIPOS_CONSULTA = [
  { value: 'CONSULTA', label: 'Consulta' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'URGENCIA', label: 'Urgência' },
  { value: 'EXAME', label: 'Exame' },
];

export const STATUS_CONSULTA = [
  { value: 'AGENDADA', label: 'Agendada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'FINALIZADA', label: 'Finalizada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'FALTOU', label: 'Faltou' },
];

// Função utilitária para validar consulta
export const validateConsulta = async (data, isEdit = false) => {
  try {
    const schema = isEdit ? consultaEditSchema : consultaSchema;
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
export const prepareConsultaForValidation = (formData) => {
  return {
    ...formData,
    dataConsulta: formData.dataConsulta ? new Date(formData.dataConsulta) : null,
    ativo: formData.ativo !== false, // Default true se não especificado
    status: formData.status || 'AGENDADA',
  };
};