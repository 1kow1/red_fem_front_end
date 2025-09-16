import { CARGOS } from '../utils/permissions';

// Utility function to capitalize first letter and lowercase the rest
const capitalizeFirstLetter = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const popupConfigs = {
  
  pacientes: {
    getConfig: (data, callbacks = {}) => {

      // Transformar consultas do paciente em array para exibição na subtabela
      const consultasArray = data.consultas && Array.isArray(data.consultas)
        ? data.consultas.map(consulta => {
            return {
              id: consulta.id,
              medico: consulta.usuarioDTO?.nome || "Não informado",
              tipoConsulta: capitalizeFirstLetter(consulta.tipoConsulta) || "N/A",
              dataHora: consulta.dataHora
                ? new Date(consulta.dataHora).toLocaleDateString("pt-BR") + " " +
                  new Date(consulta.dataHora).toLocaleTimeString("pt-BR", {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : "N/A",
              status: capitalizeFirstLetter(consulta.status) || "N/A",
              formulario: consulta.execucaoFormulario?.formulario?.titulo || "Não associado",
              liberado: consulta.execucaoFormulario?.isLiberado ? "Sim" : "Não",
              // Dados originais ocultos para funcionalidade (começam com _)
              _consulta: consulta,
              _execucaoFormulario: consulta.execucaoFormulario
            };
          })
        : [];


      return {
        title: `Paciente ${data.nome}`,
        fields: [
          { label: "CPF", key: "cpf" },
          { label: "Email", key: "email" },
          { label: "Sexo", key: "_sexo" },
          { label: "Telefone", key: "telefone" },
          { label: "Data de Nascimento", key: "_dataDeNascimento" },
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
        ],
        subTable: {
          title: "Histórico de Consultas",
          data: consultasArray,
          dataType: "consultas",
          disablePopup: true
        }
      };
    }
  },

  usuarios: {
    getConfig: (data, callbacks = {}, userCargo = null) => {
      const isActive = data.ativo === true || data.ativo === "Sim";
      const isAdmin = userCargo === CARGOS.ADMINISTRADOR;

      const actions = [
        {
          label: isActive ? "Desativar" : "Reativar",
          variant: "secondary",
          onClick: callbacks.onToggle
        }
      ];

      // Só admin pode alterar senha
      if (isAdmin) {
        actions.push({
          label: "Alterar Senha",
          variant: "secondary",
          onClick: callbacks.onChangePassword
        });
      }

      actions.push({
        label: "Editar",
        variant: "primary",
        onClick: callbacks.onEdit
      });

      return {
        title: data.nome,
        fields: [
          { label: "Email", key: "email" },
          { label: "Telefone", key: "telefone"},
          { label: "Cargo", key: "cargoFormatado" },
          { label: "Especialidade", key: "especialidadeFormatada" },
          { label: "CRM", key: "crm" },
          { label: "Ativo", key: "ativo" }
        ],
        actions
      };
    }
  },

  consultas: {
    getConfig: (data, callbacks = {}, userCargo = null) => {
      // Verificar se já tem associação e se está liberado
      const hasExecucaoFormulario = !!data._execucaoFormulario;
      const isFormularioLiberado = hasExecucaoFormulario && (
        data._execucaoFormulario.liberado === "Sim" ||
        data._execucaoFormulario._exec?.isLiberado === true
      );

      // Secretárias não podem remover associações
      const canRemoveAssociation = userCargo !== "RECEPCIONISTA";

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
          { label: "Paciente", key: "paciente" },
          { label: "Médico", key: "medico" },
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
          addButton: hasExecucaoFormulario ? null : {
            label: "Associar Formulário",
            onClick: callbacks.onAssociarFormulario
          },
          actionButtons: hasExecucaoFormulario && !isFormularioLiberado && canRemoveAssociation ? [
            {
              label: "Remover Associação",
              variant: "danger",
              onClick: () => callbacks.onRemoverAssociacao(data)
            }
          ] : [],
          disablePopup: true // Sempre desabilitar popup - usar redirecionamento direto
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
            const execId = execData.id || execData._exec?.id;

            if (execId) {
              if (callbacks.onAbrirExecucao) {
                callbacks.onAbrirExecucao(execId, execData._exec || execData);
              }
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
    getConfig: (data, callbacks = {}) => {
      // Verificar se o formulário está ativo para determinar se pode ser editado
      const isAtivo = data.ativo === true || data.ativo === "true";
      const isLiberado = data.liberadoParaUso === "Sim" || data.liberadoParaUso === true;

      const actions = [
        {
          label: isAtivo ? "Editar" : "Visualizar",
          variant: "primary",
          onClick: isAtivo ? callbacks.onEdit : callbacks.onView || callbacks.onEdit
        }
      ];

      return {
        title: data.titulo,
        fields: [
          { label: "Título", key: "titulo" },
          { label: "Descrição", key: "descricao"},
          { label: "Especialidade", key: "especialidade" },
          { label: "Versão", key: "versao"},
          { label: "Liberado?", key: "liberadoParaUso"},
          { label: "Ativo", key: "ativo", format: (value) => value ? "Sim" : "Não" }
        ],
        actions
      };
    }
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