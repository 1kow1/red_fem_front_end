import React from 'react';
import { X, Keyboard, Info, Lightbulb } from 'lucide-react';

/**
 * Modal de Ajuda Contextual (acionado por F1)
 * Mostra ajuda específica baseada na página/contexto atual
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {Function} props.onClose - Callback para fechar o modal
 * @param {string} props.context - Contexto/página atual (ex: 'formulario-editor', 'consultas')
 */
const ContextualHelpModal = ({ isOpen, onClose, context }) => {
  if (!isOpen) return null;

  // Configuração de ajuda por contexto
  const helpContent = {
    'formulario-editor': {
      title: 'Editor de Formulários',
      sections: [
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Tipos de Questões',
          items: [
            '<strong>Textual:</strong> Resposta livre em texto (para descrições, sintomas, etc)',
            '<strong>Dicotômica:</strong> Sim/Não (para perguntas binárias)',
            '<strong>Múltipla Escolha:</strong> Permite selecionar várias alternativas',
            '<strong>Seleção Única:</strong> Permite selecionar apenas uma alternativa'
          ]
        },
        {
          icon: <Keyboard className="w-5 h-5" />,
          title: 'Atalhos de Teclado',
          items: [
            '<strong>Ctrl+Z:</strong> Desfazer última ação (até 50 ações)',
            '<strong>Ctrl+Y:</strong> Refazer ação desfeita',
            '<strong>F1:</strong> Abrir esta ajuda'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Versionamento',
          items: [
            'Formulários <strong>não liberados</strong> podem ser editados livremente',
            'Ao liberar um formulário, ele fica <strong>disponível para consultas</strong>',
            'Editar um formulário liberado cria uma <strong>nova versão automaticamente</strong>',
            'Versões antigas permanecem acessíveis para consultas já criadas'
          ]
        }
      ]
    },
    'execucao-formulario': {
      title: 'Execução de Formulário',
      sections: [
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Como Funciona',
          items: [
            'Preencha todas as questões do formulário durante a consulta',
            '<strong>Salvar:</strong> Mantém o formulário em andamento (pode editar depois)',
            '<strong>Liberar:</strong> Finaliza o formulário (não pode mais editar)',
            'Formulários são <strong>liberados automaticamente à meia-noite</strong> se não finalizados'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Permissões',
          items: [
            '<strong>Médicos e Residentes:</strong> Podem salvar e liberar formulários',
            '<strong>Acadêmicos:</strong> Podem apenas visualizar (somente leitura)',
            '<strong>Recepcionistas:</strong> Não têm acesso a execuções',
            'Formulários liberados ficam <strong>permanentemente bloqueados</strong>'
          ]
        }
      ]
    },
    'consultas': {
      title: 'Gerenciamento de Consultas',
      sections: [
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Status de Consultas',
          items: [
            '<strong>PENDENTE:</strong> Consulta agendada, aguardando realização',
            '<strong>CONCLUÍDA:</strong> Consulta realizada e finalizada',
            '<strong>CANCELADA:</strong> Consulta foi cancelada'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Associação de Formulários',
          items: [
            'Clique em uma consulta para ver detalhes',
            'Associe formulários <strong>liberados</strong> às consultas',
            'Cada associação cria uma <strong>nova execução</strong> do formulário',
            'Execute o formulário durante ou após a consulta'
          ]
        },
        {
          icon: <Keyboard className="w-5 h-5" />,
          title: 'Filtros e Busca',
          items: [
            'Por padrão, mostra apenas registros <strong>ATIVOS</strong>',
            'Use os filtros para encontrar consultas específicas',
            'Gere relatórios em <strong>CSV ou PDF</strong> das consultas'
          ]
        }
      ]
    },
    'pacientes': {
      title: 'Gerenciamento de Pacientes',
      sections: [
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Cadastro de Pacientes',
          items: [
            'Cadastre pacientes com dados completos (nome, CPF, contato, endereço)',
            'CPF deve ser <strong>único</strong> no sistema',
            'Campos marcados com <strong>*</strong> são obrigatórios'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Ativação/Desativação',
          items: [
            '<strong>Desativar:</strong> Oculta o paciente das listagens (não apaga)',
            '<strong>Ativar:</strong> Torna o paciente visível novamente',
            'Pacientes desativados mantêm todo seu histórico',
            'Por padrão, a lista mostra apenas pacientes <strong>ATIVOS</strong>'
          ]
        }
      ]
    },
    'usuarios': {
      title: 'Gerenciamento de Usuários',
      sections: [
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Papéis do Sistema',
          items: [
            '<strong>Administrador:</strong> Acesso total ao sistema',
            '<strong>Médico:</strong> Gerencia pacientes, consultas e formulários',
            '<strong>Residente:</strong> Similar ao médico, com algumas restrições',
            '<strong>Acadêmico:</strong> Acesso apenas para visualização',
            '<strong>Recepcionista:</strong> Gerencia agendamentos e pacientes'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Cadastro de Usuários',
          items: [
            'Email e CRM devem ser <strong>únicos</strong>',
            'Senha inicial deve ter <strong>mínimo 6 caracteres</strong>',
            'Usuário pode <strong>alterar própria senha</strong> depois',
            'Desativar usuário <strong>bloqueia o acesso</strong> imediatamente'
          ]
        }
      ]
    },
    'formularios': {
      title: 'Gerenciamento de Formulários',
      sections: [
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Ciclo de Vida',
          items: [
            '<strong>1. Criar:</strong> Crie um novo formulário com título e descrição',
            '<strong>2. Editar:</strong> Adicione questões ao formulário',
            '<strong>3. Liberar:</strong> Torne o formulário disponível para uso',
            '<strong>4. Versionar:</strong> Edições em formulários liberados criam novas versões'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Boas Práticas',
          items: [
            'Teste o formulário antes de liberar',
            'Use nomes descritivos para as questões',
            'Agrupe questões relacionadas em sequência',
            'Versões antigas permanecem vinculadas às consultas existentes'
          ]
        }
      ]
    },
    'default': {
      title: 'Ajuda do Sistema',
      sections: [
        {
          icon: <Keyboard className="w-5 h-5" />,
          title: 'Atalhos Globais',
          items: [
            '<strong>F1:</strong> Abrir ajuda contextual (esta janela)',
            '<strong>Esc:</strong> Fechar modais e pop-ups'
          ]
        },
        {
          icon: <Info className="w-5 h-5" />,
          title: 'Navegação',
          items: [
            'Use o menu lateral para acessar as diferentes áreas',
            'Clique no logo RedFem para voltar à página inicial',
            'Seu papel determina quais páginas você pode acessar'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Dicas Gerais',
          items: [
            'Passe o mouse sobre os <strong>ícones de ?</strong> para ver dicas',
            'Por padrão, listas mostram apenas itens <strong>ATIVOS</strong>',
            'Use os filtros para encontrar registros específicos',
            'Ações irreversíveis sempre pedem confirmação'
          ]
        }
      ]
    }
  };

  const currentHelp = helpContent[context] || helpContent['default'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-redfemPink to-redfemActionPink text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentHelp.title}</h2>
              <p className="text-sm opacity-90">Pressione F1 a qualquer momento para ajuda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            aria-label="Fechar ajuda"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-5rem)]">
          <div className="space-y-6">
            {currentHelp.sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-redfemPink">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                </div>
                <ul className="space-y-2 ml-8">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: `• ${item}` }}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-redfemVariantPink bg-opacity-30 rounded-lg border border-redfemPink border-opacity-30">
            <p className="text-sm text-gray-700">
              <strong>💡 Dica:</strong> Para mais informações detalhadas, visite a página{' '}
              <span className="text-redfemDarkPink font-semibold">Ajuda</span> no menu lateral.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextualHelpModal;
