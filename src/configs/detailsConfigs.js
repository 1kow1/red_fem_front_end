export const popupConfigs = {
  pacientes: {
    getConfig: (data) => ({
      title: `Paciente ${data.nome}`,
      fields: [
        { label: "Sexo", key: "sexo" },
        { label: "Email", key: "email" },
        { label: "Telefone", key: "telefone" },
        { label: "Data de Nascimento", key: "dataNasc", type: "date" },
        { label: "Estado Civil", key: "estadoCivil" },
        { label: "Profissão", key: "profissao" },
        { label: "Endereço", key: "endereco" },
        { label: "Cidade", key: "cidade" },
        { label: "Estado", key: "uf" },
        { label: "CPF", key: "cpf" }
      ],
      actions: [
        {
          label: "Desativar",
          variant: "secondary",
          onClick: (data) => console.log("Desativar paciente:", data)
        },
        {
          label: "Editar",
          variant: "primary", 
          onClick: (data) => console.log("Editar paciente:", data)
        }
      ]
    })
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
    getConfig: (data) => ({
      title: data.nome,
      fields: [
        { label: "Nome", key: "nome" },
        { label: "Data do Preenchimento", key: "dataPreenchimento", type: "date" },
        { label: "Status", key: "status" },
      ],
      actions: [
        {
          label: "Visualizar",
          variant: "primary",
          onClick: (data) => console.log("Visualizar formulário:", data)
        },
        {
          label: "Editar",
          variant: "secondary",
          onClick: (data) => console.log("Editar formulário:", data)
        }
      ]
    })
  },

  usuarios: {
    getConfig: (data) => ({
      title: data.nome,
      fields: [
        { label: "Email", key: "email" },
        { label: "Cargo", key: "cargo" },
        { label: "Especialidade", key: "especialidade" },
        { label: "CRM", key: "crm" },
        { label: "Ativo", key: "ativo" }
      ],
      actions: [
        {
          label: "Reativar",
          variant: "secondary",
          onClick: (data) => console.log("Reativar usuário:", data)
        },
        {
          label: "Desativar",
          variant: "secondary",
          onClick: (data) => console.log("Desativar usuário:", data)
        },
        {
          label: "Editar",
          variant: "primary",
          onClick: (data) => console.log("Editar:", data)
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