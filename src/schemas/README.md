# Schema de Validação para Consultas

Este documento descreve o sistema completo de validação para consultas médicas usando Yup e React Hook Form.

## Arquivos

### `consultaSchema.js`
- **`consultaSchema`**: Validação para criação de consultas
- **`consultaEditSchema`**: Validação para edição de consultas
- **`consultaFilterSchema`**: Validação para filtros de busca
- **Constantes**: `TIPOS_CONSULTA` e `STATUS_CONSULTA`
- **Funções utilitárias**: `validateConsulta()`, `prepareConsultaForValidation()`

### `useConsultaForm.js`
- **`useConsultaForm`**: Hook principal para formulários de consulta
- **`useConsultaFilter`**: Hook para filtros de busca

## Estrutura de Dados

### Consulta Completa
```javascript
{
  // Obrigatórios
  patientId: "string",           // ID do paciente
  medicoId: "string",            // ID do médico
  dataConsulta: Date,            // Data da consulta
  horario: "HH:MM",             // Horário no formato 24h
  tipoConsulta: "CONSULTA|RETORNO|URGENCIA|EXAME",

  // Opcionais
  id: "string",                  // ID da consulta (para edição)
  status: "AGENDADA|CONFIRMADA|EM_ANDAMENTO|FINALIZADA|CANCELADA|FALTOU",
  ativo: boolean,                // Default: true

  // Execução de formulário (opcional)
  execucaoFormulario: {
    id: "string",
    formularioId: "string",
    respostas: Array,
    isSalvo: boolean,
    isLiberado: boolean
  }
}
```

## Regras de Validação

### Campos Obrigatórios
- ✅ **patientId**: Deve ser selecionado
- ✅ **medicoId**: Deve ser selecionado
- ✅ **dataConsulta**: Data válida, não anterior a hoje
- ✅ **horario**: Formato HH:MM válido
- ✅ **tipoConsulta**: Valor permitido

### Validações Especiais
- ✅ **Data + Horário futura**: Combinação deve ser no futuro
- ✅ **Formato de horário**: Regex `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`
- ✅ **Enum validation**: Tipos e status devem ser valores válidos

### Validação Condicional
- ✅ **execucaoFormulario.formularioId**: Obrigatório se execução fornecida

## Uso Básico

### 1. Hook useConsultaForm

```javascript
import { useConsultaForm } from '../hooks/useConsultaForm';
import { createConsulta } from '../services/consultaAPI';

const MyComponent = () => {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isFormValid
  } = useConsultaForm();

  const handleFormSubmit = onSubmit(
    (data) => createConsulta(data),
    'Consulta criada com sucesso!'
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <select {...register('patientId')}>
        <option value="">Selecione um paciente</option>
      </select>
      {errors.patientId && <span>{errors.patientId.message}</span>}

      <button type="submit" disabled={!isFormValid}>
        Salvar
      </button>
    </form>
  );
};
```

### 2. Validação Manual

```javascript
import { validateConsulta } from '../schemas/consultaSchema';

const validateData = async (consultaData) => {
  const result = await validateConsulta(consultaData, false); // false = nova consulta

  if (result.isValid) {
    console.log('Dados válidos:', result.data);
  } else {
    console.log('Erros:', result.errors);
  }
};
```

### 3. Hook para Filtros

```javascript
import { useConsultaFilter } from '../hooks/useConsultaForm';

const FilterComponent = () => {
  const {
    register,
    applyFilters,
    clearFilters,
    watchedValues
  } = useConsultaFilter((filters) => {
    console.log('Filtros aplicados:', filters);
  });

  return (
    <div>
      <input type="date" {...register('dataInicio')} />
      <select {...register('status')}>
        <option value="">Todos</option>
        <option value="AGENDADA">Agendada</option>
      </select>

      <button onClick={applyFilters}>Filtrar</button>
      <button onClick={clearFilters}>Limpar</button>
    </div>
  );
};
```

## Mensagens de Erro

### Português (Personalizadas)
- `"Paciente é obrigatório"`
- `"Médico é obrigatório"`
- `"Data da consulta é obrigatória"`
- `"Data não pode ser anterior a hoje"`
- `"Horário é obrigatório"`
- `"Formato de horário inválido (HH:MM)"`
- `"Tipo de consulta é obrigatório"`
- `"Horário deve ser no futuro"`

## Constantes Disponíveis

### Tipos de Consulta
```javascript
TIPOS_CONSULTA = [
  { value: 'CONSULTA', label: 'Consulta' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'URGENCIA', label: 'Urgência' },
  { value: 'EXAME', label: 'Exame' },
]
```

### Status da Consulta
```javascript
STATUS_CONSULTA = [
  { value: 'AGENDADA', label: 'Agendada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'FINALIZADA', label: 'Finalizada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'FALTOU', label: 'Faltou' },
]
```

## Funções Utilitárias

### `prepareConsultaForValidation(formData)`
Prepara os dados do formulário para validação:
- Converte `dataConsulta` para Date
- Define valores padrão
- Normaliza campos booleanos

### `validateConsulta(data, isEdit)`
Valida dados da consulta:
- Retorna `{ isValid, data, errors }`
- `isEdit = true` usa schema de edição
- Coleta todos os erros (`abortEarly: false`)

## Integração com React Hook Form

### Resolver Yup
```javascript
import { yupResolver } from '@hookform/resolvers/yup';

const form = useForm({
  resolver: yupResolver(consultaSchema),
  mode: 'onChange', // Validação em tempo real
});
```

### Validação em Tempo Real
```javascript
const handleFieldBlur = async (fieldName, value) => {
  await validateField(fieldName, value);
};

<input
  {...register('horario')}
  onBlur={(e) => handleFieldBlur('horario', e.target.value)}
/>
```

## Exemplo Completo

Veja `ConsultaFormExample.jsx` para um exemplo completo de uso com:
- Validação em tempo real
- Tratamento de erros
- Estados de loading
- Preparação de dados para API
- Interface responsiva

## Benefícios

### ✅ Validação Robusta
- Validação client-side antes de enviar para API
- Mensagens de erro claras em português
- Validação de regras de negócio (data futura, etc.)

### ✅ Developer Experience
- Hooks prontos para uso
- Tipagem implícita via schemas
- Integração seamless com React Hook Form

### ✅ Consistência
- Regras centralizadas
- Reutilização entre componentes
- Manutenção facilitada

### ✅ Performance
- Validação otimizada
- Validação condicional
- Modo onChange para feedback imediato