import { formConfigs } from "./formConfig";

export const filterConfigs = {
    usuarios: [
        {
            name: "cargo",
            label: formConfigs['usuarios'].fields.find(item => item.name === 'cargo').label,
            type: formConfigs['usuarios'].fields.find(item => item.name === 'cargo').type,
            options: formConfigs['usuarios'].fields.find(item => item.name === 'cargo').options
        },
        {
            name: "especialidade",
            label: formConfigs['usuarios'].fields.find(item => item.name === 'especialidade').label,
            type: formConfigs['usuarios'].fields.find(item => item.name === 'especialidade').type,
            options: formConfigs['usuarios'].fields.find(item => item.name === 'especialidade').options
        },
        {
            name: "ativo",
            label: "Ativo",
            type: "boolean",
            options: [
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
            ]
        }
    ],

    pacientes: [
        {
            name: "ativo",
            label: "Ativo",
            type: "boolean",
            options: [
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
            ]
        }
    ],

    consultas: [
        {
            name: "dataConsulta",
            label: formConfigs['consultas'].fields.find(item => item.name === 'dataConsulta').label,
            type: formConfigs['consultas'].fields.find(item => item.name === 'dataConsulta').type,
            options: formConfigs['consultas'].fields.find(item => item.name === 'dataConsulta').options
        },
        {
            name: "tipoConsulta",
            label: formConfigs['consultas'].fields.find(item => item.name === 'tipoConsulta').label,
            type: formConfigs['consultas'].fields.find(item => item.name === 'tipoConsulta').type,
            options: formConfigs['consultas'].fields.find(item => item.name === 'tipoConsulta').options
        }
    ],

    formularios: [
        {
            name: "liberadoParaUso",
            label: "Liberado para Uso",
            type: "boolean",
            options: [
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
            ]
        },
        {
            name: "especialidade",
            label: formConfigs['usuarios'].fields.find(item => item.name === 'especialidade').label,
            type: formConfigs['usuarios'].fields.find(item => item.name === 'especialidade').type,
            options: formConfigs['usuarios'].fields.find(item => item.name === 'especialidade').options
        }
    ]
}