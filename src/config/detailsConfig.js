export const popupConfigs = {
  
  pacientes: {
    getConfig: (data, callbacks = {}) => ({
      title: `Paciente ${data.nome}`,
      fields: [
        { label: "Sexo", key: "sexo" },
        { label: "Email", key: "email" },
        { label: "Telefone", key: "telefone" },
        { label: "Data de Nascimento", key: "dataDeNascimento", type: "date" },
        { label: "Estado Civil", key: "estadoCivil" },
        { label: "Profissão", key: "profissao" },
        { label: "Cidade", key: "cidade" },
        { label: "Estado", key: "uf" },
        { label: "CPF", key: "cpf" },
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
      title: data.pacienteNome || data.nome,
      fields: [
        { label: "Médico Solicitante", key: "medico" },
        { label: "Data da Consulta", key: "dataConsulta", type: "datetime" },
        { label: "Tipo da Consulta", key: "tipoConsulta" },
        { label: "Status", key: "status" }
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
          label: "Liberar",
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