import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { consultaSchema, consultaEditSchema, prepareConsultaForValidation } from '../schemas/consultaSchema';
import { useErrorHandler } from './useErrorHandler';

export const useConsultaForm = (isEdit = false, defaultValues = {}) => {
  const { showError, showSuccess } = useErrorHandler();

  // Valores padrão para nova consulta
  const defaultFormValues = {
    patientId: '',
    medicoId: '',
    dataConsulta: '',
    horario: '',
    tipoConsulta: 'CONSULTA',
    status: 'AGENDADA',
    ativo: true,
    execucaoFormulario: null,
    ...defaultValues
  };

  const form = useForm({
    resolver: yupResolver(isEdit ? consultaEditSchema : consultaSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange', // Validação em tempo real
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    reset,
    watch,
    clearErrors,
    setError
  } = form;

  // Função para preparar dados antes de enviar para API
  const prepareDataForSubmission = (data) => {
    const prepared = prepareConsultaForValidation(data);

    // Combinar data e horário para dataHora
    if (prepared.dataConsulta && prepared.horario) {
      const [hora, minuto] = prepared.horario.split(':');
      const dataHora = new Date(prepared.dataConsulta);
      dataHora.setHours(parseInt(hora), parseInt(minuto), 0, 0);
      prepared.dataHora = dataHora.toISOString();
    }

    return prepared;
  };

  // Função para lidar com submissão do formulário
  const onSubmit = async (apiCall, successMessage) => {
    return handleSubmit(async (data) => {
      try {
        const preparedData = prepareDataForSubmission(data);
        const result = await apiCall(preparedData);

        if (successMessage) {
          showSuccess(successMessage);
        }

        return { success: true, data: result };
      } catch (error) {
        showError(error);
        return { success: false, error };
      }
    });
  };

  // Função para definir valores do formulário a partir dos dados da API
  const setFormValues = (consultaData) => {
    if (consultaData.dataHora) {
      const dataHora = new Date(consultaData.dataHora);
      consultaData.dataConsulta = dataHora.toISOString().split('T')[0];
      consultaData.horario = dataHora.toTimeString().substring(0, 5);
    }

    // Reset com novos valores
    reset({
      ...defaultFormValues,
      ...consultaData
    });
  };

  // Função para validar campo específico
  const validateField = async (fieldName, value) => {
    try {
      const schema = isEdit ? consultaEditSchema : consultaSchema;
      await schema.validateAt(fieldName, { [fieldName]: value });
      clearErrors(fieldName);
      return true;
    } catch (error) {
      setError(fieldName, { message: error.message });
      return false;
    }
  };

  // Função para validar todo o formulário
  const validateForm = async () => {
    const data = getValues();
    try {
      const schema = isEdit ? consultaEditSchema : consultaSchema;
      await schema.validate(prepareConsultaForValidation(data), { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error.inner) {
        const formErrors = error.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          setError(err.path, { message: err.message });
          return acc;
        }, {});
        return { isValid: false, errors: formErrors };
      }
      return { isValid: false, errors: { general: error.message } };
    }
  };

  return {
    // React Hook Form básico
    register,
    handleSubmit,
    errors,
    isValid,
    isDirty,
    setValue,
    getValues,
    reset,
    watch,
    clearErrors,
    setError,

    // Funções customizadas
    onSubmit,
    setFormValues,
    validateField,
    validateForm,
    prepareDataForSubmission,

    // Estado do formulário
    isFormValid: isValid && isDirty,
  };
};

// Hook para usar em componentes de filtro
export const useConsultaFilter = (onFilterChange) => {
  const form = useForm({
    defaultValues: {
      dataInicio: '',
      dataFim: '',
      medicoId: '',
      patientId: '',
      status: '',
      tipoConsulta: '',
      page: 0,
      size: 10
    },
    mode: 'onChange'
  });

  const { watch, setValue, getValues, reset } = form;

  // Watch para mudanças nos filtros
  const watchedValues = watch();

  // Aplicar filtros
  const applyFilters = () => {
    const filterData = getValues();
    const cleanFilters = Object.keys(filterData).reduce((acc, key) => {
      if (filterData[key] !== '' && filterData[key] !== null) {
        acc[key] = filterData[key];
      }
      return acc;
    }, {});

    if (onFilterChange) {
      onFilterChange(cleanFilters);
    }

    return cleanFilters;
  };

  // Limpar filtros
  const clearFilters = () => {
    reset();
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return {
    ...form,
    watchedValues,
    applyFilters,
    clearFilters
  };
};