import { consultaSchema } from '../schemas/consultaSchema';

export const formConfigs = {
  // Formulário para USUÁRIOS
  usuarios: [
    {
      name: "nome",
      label: "Nome",
      type: "text",
      placeholder: "Insira o Nome",
    },
    {
      name: "email",
      label: "E-mail",
      type: "email",
      placeholder: "email@email.com",
    },
    {
      name: "telefone",
      label: "Telefone",
      type: "tel",
      placeholder: "42999999999",
    },
    {
      name: "cargo",
      label: "Cargo",
      type: "select",
      placeholder: "Selecione o cargo",
      options: [
        { value: "RECEPCIONISTA", label: "Recepcionista" },
        { value: "MEDICO", label: "Médico" },
        { value: "RESIDENTE", label: "Residente" },
        { value: "ACADEMICO", label: "Acadêmico" }
      ]
    },
    {
      name: "especialidade",
      label: "Especialidade",
      type: "select",
      placeholder: "Selecione a especialidade",
      options: [
        { value: "GINECOLOGIA", label: "Ginecologia"},
        { value: "ONCOLOGIA", label: "Oncologia"},
        { value: "ODONTOLOGIA", label: "Odontologia"}
      ],
      showIf: (formData) => ["MEDICO", "RESIDENTE", "ACADEMICO"].includes(formData.cargo)
    },
    {
      name: "crm",
      label: "CRM",
      type: "text",
      placeholder: "CRM/PR 123456",
      showIf: (formData) => ["MEDICO", "RESIDENTE"].includes(formData.cargo)
    },
  ],

  // Formulário para PACIENTES
  pacientes: [
    {
      name: "nome",
      label: "Nome Completo",
      type: "text",
      placeholder: "Digite o nome completo",
    },
    {
      name: "cpf",
      label: "CPF",
      type: "text",
      placeholder: "000.000.000-00",
    },
    {
      name: "dataDeNascimento",
      label: "Data de Nascimento",
      type: "date",
    },
    {
      name: "telefone",
      label: "Telefone",
      type: "tel",
      placeholder: "42999999999",
    },
    {
      name: "email",
      label: "E-mail",
      type: "email",
      placeholder: "paciente@email.com",
    },
    {
      name: "profissao",
      label: "Profissão",
      type: "text",
      placeholder: "Digite a profissão",
    },
    {
      name: "sexo",
      label: "Sexo",
      type: "select",
      placeholder: "Selecione o sexo",
      options: [
        { value: "F", label: "Feminino" },
        { value: "M", label: "Masculino" },
      ],
    },
    {
      name: "estadoCivil",
      label: "Estado Civil",
      type: "select",
      placeholder: "Selecione o estado civil",
      options: [
        { value: "CASADA", label: "Casada" },
        { value: "CASADO", label: "Casado" },
        { value: "DIVORCIADA", label: "Divorciada" },
        { value: "DIVORCIAD0", label: "Divorciado" },
        { value: "SOLTEIRA", label: "Solteira" }, 
        { value: "SOLTEIRO", label: "Solteiro" }, 
        { value: "VIÚVA", label: "Viúva" },
        { value: "VIÚVO", label: "Viúvo" },
      ],
    },
    {
      name: "cidade",
      label: "Cidade",
      type: "text",
      placeholder: "Nome da cidade",
    },
    {
      name: "uf",
      label: "Estado",
      type: "select",
      placeholder: "Selecione o estado",
      options: [
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
      ],
    },
  ],

  // Formulário para CONSULTAS
  consultas: {
    fields: [
      {
        name: "patientId",
        label: "Paciente",
        type: "async-select",
        placeholder: "Digite para buscar paciente",
        apiKey: "pacientes", // usado para abstrair qual endpoint chamar
        required: true
      },
      {
        name: "medicoId",
        label: "Médico",
        type: "async-select",
        placeholder: "Digite para buscar médico",
        apiKey: "users", // chama getUsers
        required: true
      },
      {
        name: "dataConsulta",
        label: "Data da Consulta",
        type: "date",
        placeholder: "",
        required: true,
        min: new Date().toISOString().split('T')[0] // Data mínima é hoje
      },
      {
        name: "horario",
        label: "Horário",
        type: "time",
        placeholder: "00:00",
        required: true
      },
      {
        name: "tipoConsulta",
        label: "Tipo da Consulta",
        type: "select",
        placeholder: "Selecione o tipo",
        required: true,
        options: [
          { value: "CONSULTA", label: "Consulta" },
          { value: "RETORNO", label: "Retorno" },
          { value: "URGENCIA", label: "Urgência" },
          { value: "EXAME", label: "Exame" },
        ],
      },
    ],
    validationSchema: consultaSchema
  },
  
};