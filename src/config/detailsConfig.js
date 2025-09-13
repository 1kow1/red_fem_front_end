export const popupConfigs = {
  
  pacientes: {
    getConfig: (data, callbacks = {}) => ({
      title: `Paciente ${data.nome}`,
      fields: [
        { label: "CPF", key: "cpf" },
        { label: "Email", key: "email" },
        { label: "Sexo", key: "_sexo" },
        { label: "Telefone", key: "telefone" },
        { label: "Data de Nascimento", key: "_dataDeNascimento", type: "date" },
        { label: "Estado Civil", key: "_estadoCivil" },
        { label: "Profissão", key: "_profissao" },
        { label: "Estado", key: "_uf" },
        { label: "Cidade", key: "_cidade" },
        { label: "Ativo", key: "ativo" }
      ],
      actions: [
        {
          label: data.ativo === "Sim" ? "Desativar" : "Reativar",
          variant: "secondary",
          onClick: callbacks.onToggle
        },
        {
          label: "Editar",
          variant: "primary",
          onClick: callbacks.onEdit
        }
      ]
    })
  },

  usuarios: {
    getConfig: (data, callbacks = {}) => {
      const isActive = data.ativo === true || data.ativo === "Sim";
      return {
        title: data.nome,
        fields: [
          { label: "Email", key: "email" },
          { label: "Telefone", key: "telefone"},
          { label: "Cargo", key: "cargo" },
          { label: "Especialidade", key: "especialidade" },
          { label: "CRM", key: "crm" },
          { label: "Ativo", key: "ativo" }
        ],
        actions: [
          {
            label: isActive ? "Desativar" : "Reativar",
            variant: "secondary",
            onClick: callbacks.onToggle
          },
          {
            label: "Editar",
            variant: "primary",
            onClick: callbacks.onEdit
          }
        ]
      };
    }
  },

  consultas: {
    getConfig: (data) => ({
      title: "Consulta - " + data.pacienteNome || data.nome,
      fields: [
        { label: "Paciente", key: "pacienteNome" },
        { label: "Médico", key: "medicoNome" },
        { label: "Especialidade", key: "especialidade" },
        { label: "Tipo da Consulta", key: "tipoConsulta" },
        { label: "Data e Hora", key: "dataHora" },
        { label: "Status", key: "status" },
        { label: "Status da Execução", key: "_statusExecucao" },
        { label: "Ativo", key: "_ativo" },
      ],
      actions: [
        {
          label: "Deletar",
          variant: "secondary",
          onClick: (data) => console.log("Cancelar consulta:", data)
        },
        {
          label: "Editar",
          variant: "primary",
          onClick: (data) => console.log("Editar consulta:", data)
        }
      ],
      subTable: data.formularios && data.formularios.length > 0 ? {
        title: "Formulários",
        data: data.formularios,
        dataType: "formularios", // Novo: tipo de dados para o Table
        addButton: { label: "Novo Formulário" }
      } : null
    })
  },

  // Nova configuração para formulários (será usada pela subtabela)
  formularios: {
    getConfig: (data, callbacks = {}) => ({
      title: data.titulo,
      fields: [
        { label: "Título", key: "titulo" },
        { label: "Descrição", key: "descricao"},
        { label: "Especialidade", key: "especialidade" },
        { label: "Versão", key: "versao"},
        { label: "Liberado?", key: "liberadoParaUso"}
      ],
      actions: [
        {
          label: "Editar",
          variant: "primary",
          onClick: callbacks.onEdit
        },
        {
          label: "Associar Formulário",
          variant: "primary",
          onClick: callbacks.onEdit
        },
        {
          label: "Desativar",
          variant: "secondary",
          onClick: (data) => console.log("Liberar Formulário:", data)
        }
      ]
    })
  },

  // Configuração GENÉRICA (fallback)
  generic: {
    getConfig: (data) => {
      // Pega automaticamente todos os campos (exceto id)
      const fields = Object.keys(data)
        .filter(key => key !== 'id')
        .map(key => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          key: key
        }));

      return {
        title: data.nome || data.name || `Item ${data.id}`,
        fields: fields
      };
    }
  }
};