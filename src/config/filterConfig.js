import { formConfigs } from "./formConfig";

export const filterConfigs = {
    usuarios: [
        {
            name: "cargos",
            label: "Cargo",
            type: "select",
            options: [
                { value: "MEDICO", label: "Médico" },
                { value: "ADMINISTRADOR", label: "Administrador" },
                { value: "RECEPCIONISTA", label: "Recepcionista" },
                { value: "RESIDENTE", label: "Residente" },
                { value: "ACADEMICO", label: "Acadêmico" }
            ]
        },
        {
            name: "especialidades",
            label: "Especialidade",
            type: "select",
            options: [
                { value: "GINECOLOGIA", label: "Ginecologia" },
                { value: "ONCOLOGIA", label: "Oncologia" },
                { value: "ODONTOLOGIA", label: "Odontologia" },
            ]
        },
        {
            name: "ativos",
            label: "Ativo",
            type: "boolean",
            options: [
                { value: true, label: "Ativo" },
                { value: false, label: "Inativo" }
            ]
        }
    ],

    pacientes: [
        {
            name: "ativo",
            label: "Ativo",
            type: "boolean",
            options: [
                { value: true, label: "Ativo" },
                { value: false, label: "Inativo" }
            ]
        },
        {
            name: "sexos",
            label: "Sexo",
            type: "select",
            options: [
                { value: "F", label: "Feminino" },
                { value: "M", label: "Masculino" }
            ]
        },
        {
            name: "estadosCivil",
            label: "Estado Civil",
            type: "select",
            options: [
                { value: "SOLTEIRA", label: "Solteira" },
                { value: "CASADA", label: "Casada" },
                { value: "DIVORCIADA", label: "Divorciada" },
                { value: "VIUVA", label: "Viúva" }
            ]
        }
    ],

    consultas: [
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "PENDENTE", label: "Pendente" },
                { value: "CONCLUIDA", label: "Concluída" },
                { value: "CANCELADA", label: "Cancelada" }
            ]
        },
        {
            name: "tiposConsulta",
            label: "Tipo de Consulta",
            type: "select",
            options: [
                { value: "CONSULTA", label: "Consulta" },
                { value: "RETORNO", label: "Retorno" }
            ]
        },
        {
            name: "data",
            label: "Data da Consulta",
            type: "date"
        }
    ],

    formularios: [
        {
            name: "liberadoParaUso",
            label: "Liberado para Uso",
            type: "boolean",
            options: [
                { value: true, label: "Liberado" },
                { value: false, label: "Não Liberado" }
            ]
        },
        {
            name: "especialidades",
            label: "Especialidade",
            type: "select",
            options: [
                { value: "GINECOLOGIA", label: "Ginecologia" },
                { value: "ONCOLOGIA", label: "Oncologia" },
                { value: "ODONTOLOGIA", label: "Odontologia" }
            ]
        },
        {
            name: "ativo",
            label: "Ativo",
            type: "boolean",
            options: [
                { value: true, label: "Ativo" },
                { value: false, label: "Inativo" }
            ]
        }
    ]
}