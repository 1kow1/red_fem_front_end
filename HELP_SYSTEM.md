# Sistema de Ajuda Contextual - RedFem Frontend

## 📋 Visão Geral

O sistema de ajuda contextual foi implementado para melhorar a experiência do usuário, fornecendo orientações rápidas e contextuais em todas as páginas do aplicativo RedFem.

## 🎯 Componentes Implementados

### 1. **HelpTooltip** (`src/components/HelpTooltip.jsx`)
Tooltip reutilizável com ícone de interrogação (❓) que aparece ao passar o mouse.

**Props:**
- `title` (string): Título do tooltip
- `content` (string): Conteúdo HTML do tooltip
- `position` (string): Posição ('top' | 'bottom' | 'left' | 'right')
- `size` (string): Tamanho do ícone ('sm' | 'md' | 'lg')
- `maxWidth` (number): Largura máxima em pixels (padrão: 300)
- `showOnHover` (boolean): Mostrar ao passar mouse (padrão: true)

**Uso:**
```jsx
import HelpTooltip from "../components/HelpTooltip";

<HelpTooltip
  title="Tipos de Questões"
  content="<strong>Texto:</strong> Resposta livre<br/><strong>Sim/Não:</strong> Resposta binária"
  position="right"
  maxWidth={320}
/>
```

### 2. **ContextualHelpModal** (`src/components/ContextualHelpModal.jsx`)
Modal de ajuda completo acionado pela tecla F1, com conteúdo específico por página.

**Props:**
- `isOpen` (boolean): Se o modal está aberto
- `onClose` (function): Callback para fechar
- `context` (string): Contexto da página atual

**Contextos disponíveis:**
- `formulario-editor` - Editor de Formulários
- `execucao-formulario` - Execução de Formulário
- `consultas` - Gerenciamento de Consultas
- `pacientes` - Gerenciamento de Pacientes
- `usuarios` - Gerenciamento de Usuários
- `formularios` - Gerenciamento de Formulários
- `default` - Ajuda geral do sistema

**Uso:**
```jsx
import ContextualHelpModal from "../components/ContextualHelpModal";

const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

<ContextualHelpModal
  isOpen={isHelpModalOpen}
  onClose={() => setIsHelpModalOpen(false)}
  context="formulario-editor"
/>
```

### 3. **useKeyboardShortcut** (`src/hooks/useKeyboardShortcut.js`)
Hook para gerenciar atalhos de teclado de forma declarativa.

**Parâmetros:**
- `keys` (string | string[]): Tecla(s) a detectar (ex: 'F1', 'Control+s')
- `callback` (function): Função a executar
- `options` (object): Opções adicionais
  - `enabled` (boolean): Se está habilitado (padrão: true)
  - `preventDefault` (boolean): Prevenir comportamento padrão (padrão: true)

**Uso:**
```jsx
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";

useKeyboardShortcut('F1', () => {
  setIsHelpModalOpen(true);
});
```

## 🚀 Funcionalidades Implementadas

### ✅ Atalho F1 Global
- **Onde:** Implementado em [Layout.jsx](src/components/Layout.jsx#L32-L34)
- **Como funciona:** Pressionar F1 em qualquer página abre o modal de ajuda contextual
- **Detecção automática:** O contexto é detectado automaticamente pela rota atual

### ✅ Tooltips Contextuais

#### Editor de Formulários ([FormularioEditor.jsx](src/pages/FormularioEditor.jsx))
- **Linha 691-696:** Tooltip sobre atalhos e versionamento no cabeçalho
- **Linha 862-867:** Tooltip explicando tipos de questões (Texto, Sim/Não, Múltipla Escolha, Seleção Única)
- **Linha 697-702:** Banner de aviso quando editando formulário liberado (cria nova versão)

#### Execução de Formulário ([ExecucaoFormulario.jsx](src/pages/ExecucaoFormulario.jsx))
- **Linha 459-464:** Tooltip sobre salvar vs liberar e auto-liberação à meia-noite
- **Linha 465-470:** Banner indicando modo somente leitura quando formulário está liberado

#### DataFrame ([DataFrame.jsx](src/components/DataFrame.jsx))
- **Linha 222-227:** Tooltip explicando filtros padrão (apenas ATIVOS)
- **Linha 231-250:** Banner informativo quando filtro "Ativo" está aplicado, com botão para "Mostrar todos"

### ✅ Indicadores Visuais

#### Modo Versão (Formulário Liberado)
```jsx
{isEditMode && formDataToEdit?.liberadoParaUso && (
  <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-300 rounded-md">
    <span className="font-semibold">⚠️ Modo Versão:</span>
    <span>Alterações criarão nova versão</span>
  </div>
)}
```

#### Modo Somente Leitura (Formulário Liberado)
```jsx
{isLiberado && (
  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-300 rounded-md">
    <span className="font-semibold">🔒 Somente Leitura:</span>
    <span>Formulário liberado</span>
  </div>
)}
```

#### Filtro Ativo
```jsx
{filters.ativo && filters.ativo.includes(true) && (
  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      <strong>Filtro Ativo:</strong> Mostrando apenas registros ativos.
      <button onClick={...}>Mostrar todos</button>
    </p>
  </div>
)}
```

## 📚 Conteúdo de Ajuda por Contexto

### Formulário Editor
- **Tipos de Questões:** Explicação de cada tipo (TEXTUAL, DICOTOMICA, MULTIPLA_ESCOLHA, SELECAO_UNICA)
- **Atalhos de Teclado:** Ctrl+Z (Desfazer), Ctrl+Y (Refazer), F1 (Ajuda)
- **Versionamento:** Como funciona a criação automática de versões

### Execução de Formulário
- **Como Funciona:** Diferença entre Salvar e Liberar
- **Auto-liberação:** Formulários são liberados automaticamente à meia-noite
- **Permissões:** Quem pode salvar/liberar formulários

### Consultas
- **Status de Consultas:** PENDENTE, CONCLUÍDA, CANCELADA
- **Associação de Formulários:** Como associar e executar
- **Filtros e Busca:** Como usar filtros e busca genérica

### Pacientes
- **Cadastro:** Campos obrigatórios e validações
- **Ativação/Desativação:** Diferença entre desativar e apagar

### Usuários
- **Papéis do Sistema:** Administrador, Médico, Residente, Acadêmico, Recepcionista
- **Cadastro:** Email e CRM únicos, senha mínima

### Formulários
- **Ciclo de Vida:** Criar → Editar → Liberar → Versionar
- **Boas Práticas:** Dicas para criação de formulários

## 🎨 Convenções de Estilo

### Cores do Sistema
- **Info/Ajuda:** `bg-blue-50`, `border-blue-200`, `text-blue-800`
- **Aviso/Atenção:** `bg-amber-50`, `border-amber-300`, `text-amber-800`
- **Sucesso:** `bg-green-50`, `border-green-200`, `text-green-800`
- **Erro:** `bg-red-50`, `border-red-200`, `text-red-800`

### Ícones Recomendados
- **ℹ️** - Informação geral
- **⚠️** - Aviso/Atenção
- **🔒** - Bloqueado/Somente leitura
- **💡** - Dica/Sugestão
- **❓** - Ajuda (usado no HelpTooltip)

## 🔧 Como Adicionar Ajuda em Novas Páginas

### Passo 1: Adicionar contexto no ContextualHelpModal.jsx

```jsx
const helpContent = {
  'minha-nova-pagina': {
    title: 'Minha Nova Página',
    sections: [
      {
        icon: <Info className="w-5 h-5" />,
        title: 'Como Usar',
        items: [
          '<strong>Passo 1:</strong> Descrição...',
          '<strong>Passo 2:</strong> Descrição...'
        ]
      }
    ]
  }
};
```

### Passo 2: Adicionar rota no Layout.jsx

```jsx
const getHelpContext = () => {
  const path = location.pathname;
  if (path.includes('/minha-rota')) return 'minha-nova-pagina';
  // ...
};
```

### Passo 3: Adicionar tooltips na página

```jsx
import HelpTooltip from "../components/HelpTooltip";

<HelpTooltip
  title="Funcionalidade X"
  content="Explicação sobre a funcionalidade X"
  position="right"
/>
```

## 🧪 Como Testar

1. **Teste o atalho F1:**
   - Abra qualquer página do app
   - Pressione F1
   - Verifique se o modal de ajuda abre com o contexto correto

2. **Teste os tooltips:**
   - Passe o mouse sobre os ícones de ❓
   - Verifique se o tooltip aparece com o conteúdo correto
   - Teste em diferentes resoluções

3. **Teste os indicadores visuais:**
   - Editor de formulários: Edite um formulário liberado e veja o banner "Modo Versão"
   - Execução: Abra um formulário liberado e veja o banner "Somente Leitura"
   - DataFrame: Verifique o banner "Filtro Ativo" nas listagens

4. **Teste responsividade:**
   - Verifique tooltips em telas menores
   - Teste o modal em diferentes resoluções

## 📝 Manutenção e Melhorias Futuras

### Sugestões de Melhorias
1. **Tour Guiado Interativo:** Implementar um tutorial interativo para novos usuários usando bibliotecas como `react-joyride`
2. **Histórico de Ajuda:** Rastrear quais tópicos de ajuda o usuário já visualizou
3. **Feedback sobre Ajuda:** Adicionar botão "Foi útil?" nos modais de ajuda
4. **Busca na Ajuda:** Adicionar campo de busca no modal de ajuda
5. **Vídeos Tutorial:** Incorporar vídeos curtos explicativos
6. **Ajuda Contextual Proativa:** Mostrar dicas automaticamente quando o usuário realizar certas ações pela primeira vez

### Onde Adicionar Mais Tooltips
1. **Botões de ação críticos:** Liberar, Excluir, Desativar
2. **Campos de formulário complexos:** Especialidades, tipos específicos
3. **Relatórios:** Diferença entre CSV e PDF
4. **Permissões:** Indicar visualmente quando ação não está disponível por falta de permissão

## 🐛 Troubleshooting

### Tooltip não aparece
- Verifique se o componente HelpTooltip foi importado corretamente
- Confirme que a prop `content` não está vazia
- Teste a prop `showOnHover` (padrão: true)

### F1 não funciona
- Verifique se useKeyboardShortcut está sendo chamado no contexto correto
- Confirme que não há conflitos com outros event listeners
- Teste se o preventDefault está ativo

### Modal não fecha com ESC
- Verifique se o onClose está conectado corretamente
- Adicione event listener para ESC no modal se necessário

## 📊 Métricas de Sucesso

Para avaliar a eficácia do sistema de ajuda, monitore:
1. **Frequência de uso do F1** - Quantas vezes os usuários acessam a ajuda
2. **Taxa de conclusão de tarefas** - Usuários completam fluxos críticos com menos erros?
3. **Redução em tickets de suporte** - Menos perguntas sobre funcionalidades básicas
4. **Feedback qualitativo** - Usuários reportam maior facilidade de uso

---

**Desenvolvido com ❤️ para melhorar a experiência do usuário RedFem**
