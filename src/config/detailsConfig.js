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
    getConfig: (data, callbacks = {}) => {
      // Transforma execucaoFormulario (objeto) em array SUPER SIMPLES
      const execucaoFormularioArray = data._execucaoFormulario 
        ? [
            {
              // Campos reordenados: Formulário, Data/Hora, Liberado
              formulario: data._execucaoFormulario.formulario || "Não associado",
              dataHora: data._execucaoFormulario.dataHora || "N/A",
              liberado: data._execucaoFormulario.liberado || "Não",
              id: data._execucaoFormulario.id || "N/A",
              
              // Dados originais ocultos para funcionalidade
              _exec: data._execucaoFormulario._exec || data._execucaoFormulario
            }
          ]
        : [];
  
      return {
        title: "Consulta",  
        fields: [
          { label: "Paciente", key: "pacienteNome" },
          { label: "Médico", key: "medicoNome" },
          { label: "Tipo da Consulta", key: "tipoConsulta" },
          { label: "Data e Hora", key: "dataHora" },
          { label: "Status", key: "status" },
          { label: "Ativo", key: "_ativo" },
        ],
        actions: [
          {
            label: "Deletar",
            variant: "secondary",
            onClick: callbacks.onToggle
          },
          {
            label: "Editar",
            variant: "primary",
            onClick: callbacks.onEdit
          },
        ],
        subTable: {
          title: "Execução do Formulário",
          data: execucaoFormularioArray,
          dataType: "execucaoFormulario",
          addButton: { 
            label: "Associar Formulário",
            onClick: callbacks.onAssociarFormulario // Nova callback
          },
          disablePopup: execucaoFormularioArray.length === 0 // Desabilita popup se não tem dados
        }
      };
    }
  },

  // Configuração ULTRA SIMPLES para execucaoFormulario
  execucaoFormulario: {
    getConfig: (data, callbacks = {}) => ({
      title: "Execução do Formulário",
      fields: [
        { label: "Formulário", key: "formulario" },
        { label: "Data e Hora", key: "dataHora" },
        { label: "Liberado", key: "liberado" },
        { label: "ID", key: "id" },
      ],
      actions: [
        {
          label: "Abrir Formulário",
          variant: "primary",
          onClick: (execData) => {
            console.log("Dados da execução clicada:", execData);
            const execId = execData.id || execData._exec?.id;
            console.log("ID extraído:", execId);

            if (execId) {
              if (callbacks.onAbrirExecucao) {
                callbacks.onAbrirExecucao(execId, execData._exec || execData);
              } else {
                console.error("Callback onAbrirExecucao não encontrada");
              }
            } else {
              console.error("ID da execução não encontrado:", execData);
            }
          }
        },
        {
          label: "Ver Detalhes",
          variant: "secondary",
          onClick: callbacks.onEdit
        }
      ]
    })
  },

  // Configuração para formulários (será usada pela subtabela)
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