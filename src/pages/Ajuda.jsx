import { useState, useEffect } from 'react';
import HelpSection from '../components/HelpSection';
import SearchableHelp from '../components/SearchableHelp';
import { Book, Users, Calendar, FileText, Edit, BarChart3 } from 'lucide-react';

export default function Ajuda() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);

  const allSections = [
    {
      id: 'visao-geral',
      title: 'Visão Geral do Sistema',
      icon: Book,
      keywords: ['sistema', 'visão', 'geral', 'anamnese', 'ginecologia', 'propósito'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Sobre o Sistema</h4>
          <p className="mb-4">
            Este é um sistema de anamnese ginecológica que permite gerenciar pacientes,
            consultas e formulários de forma integrada.
          </p>

          <h4 className="text-md font-semibold mb-3">Fluxo Principal</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li><strong>Cadastrar pacientes</strong> com dados pessoais</li>
            <li><strong>Agendar consultas</strong> para os pacientes</li>
            <li><strong>Associar formulários</strong> às consultas</li>
            <li><strong>Preencher formulários</strong> durante as consultas</li>
            <li><strong>Gerar relatórios</strong> com os dados coletados</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Navegação</h4>
          <p>Use a barra lateral esquerda para navegar entre as seções:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Consultas:</strong> Página inicial com consultas agendadas</li>
            <li><strong>Formulários:</strong> Criar e gerenciar formulários</li>
            <li><strong>Pacientes:</strong> Cadastro e histórico de pacientes</li>
            <li><strong>Usuários:</strong> Gerenciar profissionais do sistema</li>
          </ul>
        </div>
      )
    },
    {
      id: 'pacientes',
      title: 'Gestão de Pacientes',
      icon: Users,
      keywords: ['pacientes', 'cadastro', 'editar', 'histórico', 'relatório', 'csv', 'pdf'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Cadastrar Paciente</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Acesse a página "Pacientes" na sidebar</li>
            <li>Clique no botão "Adicionar"</li>
            <li>Preencha os dados pessoais (nome, CPF, email, telefone, etc.)</li>
            <li>Clique em "Salvar"</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Visualizar Histórico</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Na lista de pacientes, clique em qualquer linha</li>
            <li>Será aberto um popup com dados detalhados</li>
            <li>A seção "Histórico de Consultas" mostra todas as consultas do paciente</li>
            <li>Clique em uma consulta para acessar a execução do formulário</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Editar Paciente</h4>
          <p className="mb-2">No popup de detalhes do paciente:</p>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Clique no botão "Editar"</li>
            <li>Modifique os dados necessários</li>
            <li>Salve as alterações</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Gerar Relatórios</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>No popup de detalhes do paciente, clique em "Gerar Relatório"</li>
            <li>Escolha o formato: CSV (planilha) ou PDF (documento)</li>
            <li>O arquivo será baixado automaticamente</li>
          </ol>
          <p className="text-sm text-gray-600">
            O relatório inclui dados do paciente, consultas realizadas e todas as respostas dos formulários.
          </p>
        </div>
      )
    },
    {
      id: 'consultas',
      title: 'Gestão de Consultas',
      icon: Calendar,
      keywords: ['consultas', 'agendar', 'associar', 'formulário', 'execução', 'status'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Agendar Consulta</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Na página "Consultas", clique em "Adicionar"</li>
            <li>Selecione o paciente</li>
            <li>Defina data, hora e tipo da consulta</li>
            <li>Salve a consulta</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Associar Formulário</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Clique na consulta desejada para abrir detalhes</li>
            <li>Na seção "Execução do Formulário", clique em "Associar Formulário"</li>
            <li>Selecione um formulário disponível</li>
            <li>Confirme a associação</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Status das Consultas</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Agendada:</strong> Consulta marcada, aguardando realização</li>
            <li><strong>Em andamento:</strong> Consulta sendo realizada</li>
            <li><strong>Concluída:</strong> Consulta finalizada</li>
            <li><strong>Cancelada:</strong> Consulta cancelada</li>
          </ul>

          <h4 className="text-md font-semibold mb-3">Acessar Execução</h4>
          <p className="mb-2">Para preencher formulários:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Clique na consulta com formulário associado</li>
            <li>Na seção "Execução do Formulário", clique na linha da execução</li>
            <li>Você será direcionado para a página de preenchimento</li>
          </ol>
        </div>
      )
    },
    {
      id: 'formularios',
      title: 'Formulários',
      icon: FileText,
      keywords: ['formulários', 'criar', 'editar', 'perguntas', 'tipos', 'versão', 'liberar'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Criar Formulário</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Na página "Formulários", clique em "Adicionar"</li>
            <li>Preencha título, descrição e especialidade</li>
            <li>Adicione perguntas usando o editor</li>
            <li>Salve o formulário</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Tipos de Perguntas</h4>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Textual:</strong> Resposta livre em texto</li>
            <li><strong>Dicotômica:</strong> Resposta Sim/Não</li>
            <li><strong>Múltipla Escolha:</strong> Várias opções podem ser selecionadas</li>
            <li><strong>Seleção Única:</strong> Apenas uma opção pode ser selecionada</li>
          </ul>

          <h4 className="text-md font-semibold mb-3">Editar Formulário</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Na lista de formulários, clique em "Editar"</li>
            <li>Modifique perguntas, adicione ou remova itens</li>
            <li>Salve as alterações</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Versionamento</h4>
          <p className="mb-2">Cada alteração em um formulário gera uma nova versão:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Versões antigas são preservadas</li>
            <li>Execuções antigas mantêm a versão original</li>
            <li>Novas consultas usam a versão mais recente</li>
          </ul>

          <h4 className="text-md font-semibold mb-3">Liberar para Uso</h4>
          <p className="mb-2">Formulários devem ser liberados para serem associados a consultas:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Teste o formulário completamente</li>
            <li>Clique em "Liberar para Uso"</li>
            <li>Confirme a liberação</li>
          </ol>
        </div>
      )
    },
    {
      id: 'execucao',
      title: 'Execução de Formulários',
      icon: Edit,
      keywords: ['execução', 'formulário', 'responder', 'liberado', 'salvar', 'respostas'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Como Responder</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Acesse a execução através de uma consulta</li>
            <li>Leia cada pergunta cuidadosamente</li>
            <li>Responda de acordo com o tipo da pergunta</li>
            <li>Use o botão "Salvar" para gravar as respostas</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Status: Liberado vs Não Liberado</h4>
          <div className="mb-4">
            <p className="font-medium mb-2">Não Liberado (Editável):</p>
            <ul className="list-disc list-inside space-y-1 mb-3 ml-4">
              <li>Formulário pode ser editado</li>
              <li>Respostas podem ser alteradas</li>
              <li>Botão "Salvar" disponível</li>
            </ul>

            <p className="font-medium mb-2">Liberado (Somente Leitura):</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Formulário não pode ser editado</li>
              <li>Apenas visualização das respostas</li>
              <li>Aparece aviso azul no topo</li>
            </ul>
          </div>

          <h4 className="text-md font-semibold mb-3">Tipos de Resposta</h4>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Texto:</strong> Digite a resposta no campo</li>
            <li><strong>Sim/Não:</strong> Clique no botão correspondente</li>
            <li><strong>Múltipla:</strong> Marque quantas opções desejar</li>
            <li><strong>Única:</strong> Selecione apenas uma opção</li>
          </ul>

          <h4 className="text-md font-semibold mb-3">Navegação</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Use "Cancelar" para sair sem salvar</li>
            <li>"Salvar" grava todas as respostas</li>
            <li>Você pode sair e voltar várias vezes antes de liberar</li>
          </ul>
        </div>
      )
    },
    {
      id: 'usuarios',
      title: 'Gestão de Usuários',
      icon: Users,
      keywords: ['usuários', 'perfil', 'editar', 'logout', 'configurações'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Editar Perfil</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Clique no botão "Configurações" na sidebar</li>
            <li>Selecione "Editar Perfil"</li>
            <li>Modifique nome, email, telefone, CRM ou especialidade</li>
            <li>Clique em "Salvar"</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Logout</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Clique no botão "Configurações" na sidebar</li>
            <li>Selecione "Logout"</li>
            <li>Você será redirecionado para a tela de login</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Gerenciar Outros Usuários</h4>
          <p className="mb-2">Na página "Usuários":</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Visualize todos os profissionais cadastrados</li>
            <li>Adicione novos usuários ao sistema</li>
            <li>Edite dados de usuários existentes</li>
            <li>Ative ou desative contas de usuário</li>
          </ul>
        </div>
      )
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: BarChart3,
      keywords: ['relatórios', 'csv', 'pdf', 'dados', 'interpretar', 'exportar'],
      content: (
        <div>
          <h4 className="text-md font-semibold mb-3">Tipos de Relatório</h4>
          <div className="mb-4">
            <p className="font-medium mb-2">CSV (Planilha Excel):</p>
            <ul className="list-disc list-inside space-y-1 mb-3 ml-4">
              <li>Ideal para análise de dados</li>
              <li>Pode ser aberto no Excel ou Google Sheets</li>
              <li>Permite filtros e gráficos</li>
              <li>Formato tabular com colunas</li>
            </ul>

            <p className="font-medium mb-2">PDF (Documento):</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Ideal para impressão</li>
              <li>Formatação visual organizada</li>
              <li>Dados do paciente + consultas</li>
              <li>Arquivo pronto para compartilhar</li>
            </ul>
          </div>

          <h4 className="text-md font-semibold mb-3">Como Gerar</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Acesse a página "Pacientes"</li>
            <li>Clique no paciente desejado</li>
            <li>No popup, clique em "Gerar Relatório"</li>
            <li>Escolha o formato (CSV ou PDF)</li>
            <li>O download iniciará automaticamente</li>
          </ol>

          <h4 className="text-md font-semibold mb-3">Interpretar Dados</h4>
          <p className="mb-2">O relatório inclui:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Dados pessoais</strong> do paciente</li>
            <li><strong>Histórico de consultas</strong> com datas e médicos</li>
            <li><strong>Respostas dos formulários</strong> organizadas por consulta</li>
            <li><strong>Status das execuções</strong> (liberado ou não)</li>
          </ul>

          <h4 className="text-md font-semibold mb-3">Casos de Uso</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Análise estatística de respostas</li>
            <li>Histórico médico para outros profissionais</li>
            <li>Backup de dados importantes</li>
            <li>Relatórios para convênios</li>
          </ul>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSections(allSections);
      return;
    }

    const filtered = allSections.filter(section => {
      const searchLower = searchTerm.toLowerCase();
      return (
        section.title.toLowerCase().includes(searchLower) ||
        section.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    });

    setFilteredSections(filtered);
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Ajuda</h1>
          <p className="text-gray-600">
            Documentação completa sobre como usar o sistema de anamnese
          </p>
        </div>

        {/* Search */}
        <SearchableHelp
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Quick Navigation */}
        {!searchTerm && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Navegação Rápida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSections.map(section => {
                const IconComponent = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IconComponent size={20} className="text-redfemActionPink" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-2">
          {filteredSections.length > 0 ? (
            filteredSections.map(section => (
              <HelpSection
                key={section.id}
                id={section.id}
                title={section.title}
                defaultOpen={searchTerm.length > 0}
              >
                {section.content}
              </HelpSection>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                Nenhum resultado encontrado para "{searchTerm}"
              </p>
              <button
                onClick={handleClear}
                className="mt-2 text-redfemActionPink hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Precisa de mais ajuda?</h3>
          <p className="text-gray-600">
            Se não encontrou o que procurava, entre em contato com o suporte técnico
            ou consulte a documentação técnica do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}