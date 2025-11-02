/**
 * Configurações de tours guiados para cada página do sistema
 * Cada tour contém um array de steps com seletores CSS e descrições
 */

export const toursConfig = {
  consultas: [
    {
      element: 'button[aria-label="Filtros"]',
      title: 'Abrir Filtros',
      description: 'Clique neste ícone de filtro para abrir as opções de filtragem. Você pode filtrar consultas por status, data ou paciente. Por padrão, apenas consultas ativas são exibidas.',
      side: 'left',
      align: 'start'
    },
    {
      element: '.flex.gap-2.items-center.w-full input[type="text"]',
      title: 'Busca Rápida',
      description: 'Use este campo para pesquisar consultas rapidamente. A busca é aplicada automaticamente enquanto você digita.',
      side: 'bottom'
    },
    {
      element: '.flex.flex-row.gap-2 button:not([aria-label])',
      title: 'Adicionar Consulta',
      description: 'Clique aqui para agendar uma nova consulta para um paciente.',
      side: 'left'
    },
    {
      element: 'table tbody tr:first-child',
      title: 'Lista de Consultas',
      description: 'Clique em qualquer linha para ver os detalhes da consulta e vincular formulários. As colunas mostram paciente, data, médico e status.',
      side: 'top'
    }
  ],

  formularios: [
    {
      element: 'button[aria-label="Filtros"]',
      title: 'Filtros de Formulários',
      description: 'Use este botão para filtrar formulários por status de liberação ou buscar por título.',
      side: 'left'
    },
    {
      element: '.flex.gap-2.items-center.w-full input[type="text"]',
      title: 'Busca Rápida',
      description: 'Pesquise formulários por título ou descrição.',
      side: 'bottom'
    },
    {
      element: '.flex.flex-row.gap-2 button:not([aria-label])',
      title: 'Criar Formulário',
      description: 'Clique aqui para criar um novo formulário de anamnese.',
      side: 'left'
    },
    {
      element: 'table tbody tr:first-child',
      title: 'Lista de Formulários',
      description: 'Visualize todos os formulários criados. Clique em qualquer linha para ver detalhes ou editar. Formulários podem estar "Liberados" (disponíveis para consultas) ou "Não Liberados" (em edição).',
      side: 'top'
    }
  ],

  'formulario-editor': [
    {
      element: 'h1.text-2xl',
      title: 'Editor de Formulários',
      description: 'Aqui você cria e edita formulários de anamnese. Use Ctrl+Z para desfazer e Ctrl+Y para refazer alterações. O sistema guarda até 50 ações.',
      side: 'bottom'
    },
    {
      element: 'input[placeholder*="título" i], input[placeholder*="Título" i]',
      title: 'Título do Formulário',
      description: 'Defina um título claro e descritivo para o formulário.',
      side: 'bottom'
    },
    {
      element: 'button:has-text("Adicionar"), button:contains("Adicionar")',
      title: 'Adicionar Pergunta',
      description: 'Clique aqui para adicionar uma nova pergunta ao formulário. Escolha entre Textual, Dicotômica, Múltipla Escolha ou Seleção Única.',
      side: 'bottom'
    },
    {
      element: 'button:has-text("Salvar"), button:contains("Salvar")',
      title: 'Salvar ou Liberar',
      description: '<strong>Revise cuidadosamente</strong> antes de clicar em "Salvar e Liberar". Formulários liberados podem ser editados, mas criam uma nova versão.',
      side: 'left'
    }
  ],

  'execucao-formulario': [
    {
      element: 'h1',
      title: 'Execução do Formulário',
      description: 'Preencha todas as perguntas durante a consulta. Lembre-se: formulários são liberados automaticamente após 1 dia se não forem finalizados manualmente.',
      side: 'bottom'
    },
    {
      element: 'form, .space-y-4',
      title: 'Respondendo Perguntas',
      description: 'Cada pergunta tem um tipo diferente: texto livre, sim/não, múltipla escolha ou seleção única. Preencha com atenção.',
      side: 'left'
    },
    {
      element: 'button[type="submit"], button:has-text("Salvar")',
      title: 'Salvar Progresso',
      description: '<strong>Salvar:</strong> grava suas respostas - você pode sair e voltar depois.<br><strong>Salvar e Liberar:</strong> finaliza permanentemente. <strong>Acadêmicos podem salvar, mas não liberar.</strong>',
      side: 'top'
    }
  ],

  pacientes: [
    {
      element: 'button[aria-label="Filtros"]',
      title: 'Filtros de Pacientes',
      description: 'Use os filtros para buscar pacientes por nome, CPF ou email. Por padrão, apenas pacientes ativos são exibidos.',
      side: 'left'
    },
    {
      element: '.flex.gap-2.items-center.w-full input[type="text"]',
      title: 'Busca Rápida',
      description: 'Pesquise pacientes por nome, CPF ou email.',
      side: 'bottom'
    },
    {
      element: '.flex.flex-row.gap-2 button:not([aria-label])',
      title: 'Cadastrar Paciente',
      description: 'Clique aqui para cadastrar um novo paciente no sistema.',
      side: 'left'
    },
    {
      element: 'table tbody tr:first-child',
      title: 'Lista de Pacientes',
      description: 'Clique em qualquer linha para ver o histórico completo do paciente, incluindo consultas e formulários preenchidos. Você pode gerar relatórios em PDF ou CSV.',
      side: 'top'
    }
  ],

  usuarios: [
    {
      element: 'button[aria-label="Filtros"]',
      title: 'Filtros de Usuários',
      description: 'Filtre usuários por cargo (Médico, Residente, Acadêmico, etc.) ou busque por nome, email ou CRM.',
      side: 'left'
    },
    {
      element: '.flex.gap-2.items-center.w-full input[type="text"]',
      title: 'Busca Rápida',
      description: 'Pesquise usuários por nome, email ou CRM.',
      side: 'bottom'
    },
    {
      element: '.flex.flex-row.gap-2 button:not([aria-label])',
      title: 'Adicionar Usuário',
      description: 'Cadastre novos profissionais no sistema. Cada cargo tem permissões específicas: Médico pode criar formulários, Acadêmico só visualiza, etc.',
      side: 'left'
    },
    {
      element: 'table tbody tr:first-child',
      title: 'Lista de Usuários',
      description: 'Visualize todos os profissionais cadastrados. Clique para editar dados ou gerenciar permissões.',
      side: 'top'
    }
  ]
};

/**
 * Retorna o tour configurado para uma página específica
 * @param {string} pageName - Nome da página (ex: 'consultas', 'formularios')
 * @returns {Array|null} Steps do tour ou null se não existir
 */
export const getTourForPage = (pageName) => {
  return toursConfig[pageName] || null;
};
