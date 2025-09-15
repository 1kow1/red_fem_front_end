# RedFem Frontend - Sistema de Anamnese Ginecológica

## 📋 Sobre o Projeto

O RedFem Frontend é uma aplicação web desenvolvida em React para gerenciamento de consultas e anamnese ginecológica. O sistema permite que profissionais de saúde criem formulários personalizados, executem consultas e gerem relatórios detalhados dos pacientes.

## 🎯 Funcionalidades Principais

### 👥 Gestão de Usuários
- Cadastro e edição de usuários do sistema
- Sistema de roles/cargos: Administrador, Médico, Residente, Acadêmico, Recepcionista
- Controle de permissões baseado em cargos
- Alteração de senhas

### 👩‍⚕️ Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico de consultas
- Geração de relatórios (CSV/PDF)
- Busca avançada com filtros

### 📋 Gestão de Formulários
- Criação de formulários personalizados
- Tipos de perguntas: Textual, Múltipla Escolha, Sim/Não
- Sistema de versionamento de formulários
- Liberação de formulários para uso (apenas Médicos e Residentes)

### 🏥 Gestão de Consultas
- Agendamento e acompanhamento de consultas
- Associação de formulários às consultas
- Execução de anamnese com formulários personalizados
- Controle de status (Agendada, Confirmada, Concluída, Cancelada)

### 📊 Sistema de Relatórios
- Exportação em CSV e PDF
- Relatórios por paciente
- Histórico completo de consultas e anamneses

## 🔐 Sistema de Permissões

### Roles e Permissões

| Funcionalidade | Administrador | Médico | Residente | Acadêmico | Recepcionista |
|---|---|---|---|---|---|
| Gestão de Usuários | ✅ | ❌ | ❌ | ❌ | ✅ |
| Gestão de Pacientes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gestão de Formulários | ✅ | ✅ | ❌ | ❌ | ❌ |
| Liberar Formulários | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gestão de Consultas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Associar Formulários | ✅ | ✅ | ✅ | ✅ | ❌ |
| Salvar e Liberar Execução | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gerar Relatórios | ✅ | ✅ | ✅ | ✅ | ✅ |

## ⚙️ Tecnologias Utilizadas

- **React 19.1.0** - Biblioteca principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **React Router DOM** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de dados
- **Axios** - Cliente HTTP
- **React Select** - Componentes de seleção avançados
- **Lucide React** - Biblioteca de ícones
- **jsPDF** - Geração de PDFs
- **React Toastify** - Notificações
- **Date-fns** - Manipulação de datas

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 18+)
- npm ou yarn
- Backend do RedFem em execução

### Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd red_fem_front_end
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em `http://localhost:5173`

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.jsx      # Componentes de botões
│   ├── Input.jsx       # Componentes de input
│   ├── Table.jsx       # Tabelas de dados
│   ├── FormPopUp.jsx   # Modal de formulários
│   └── ...
├── pages/              # Páginas principais
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Pacientes.jsx
│   ├── Consultas.jsx
│   ├── Formularios.jsx
│   └── ...
├── services/           # Serviços de API
│   ├── axios.js        # Configuração do Axios
│   ├── userAPI.js      # APIs de usuários
│   ├── pacienteAPI.js  # APIs de pacientes
│   └── ...
├── utils/              # Utilitários
│   ├── permissions.js  # Sistema de permissões
│   └── reportUtils.js  # Geração de relatórios
├── contexts/           # Contexts do React
│   └── auth/          # Context de autenticação
├── config/            # Configurações
└── hooks/             # Hooks customizados
```

## 🔄 Fluxo de Trabalho dos Formulários

### 1. Criação de Formulários
- Médicos e Administradores podem criar novos formulários
- Formulários contêm perguntas de diferentes tipos
- Versionamento automático para modificações

### 2. Liberação para Uso
- Apenas Médicos, Residentes e Administradores podem liberar formulários
- Formulários liberados ficam disponíveis para associação às consultas
- **Operação irreversível** - formulários liberados não podem ser bloqueados

### 3. Associação às Consultas
- Formulários liberados podem ser associados às consultas
- Cada consulta pode ter múltiplos formulários
- Associação realizada por profissionais autorizados

### 4. Execução da Anamnese
- Preenchimento das respostas durante a consulta
- Sistema de salvamento parcial
- Validação de campos obrigatórios antes da liberação

### 5. Liberação Automática
- **IMPORTANTE**: Formulários salvos e não liberados até meia-noite do mesmo dia são automaticamente liberados pelo sistema
- Após liberação, formulários tornam-se somente leitura

## 🔍 Sistema de Filtros

Por padrão, todas as páginas filtram por registros **ativos**. Os filtros disponíveis incluem:

- **Status de ativação** (Ativo/Inativo)
- **Especialidades médicas**
- **Datas de consulta**
- **Status de liberação de formulários**
- **Busca textual** em todos os campos relevantes

## 🎨 Personalização e Temas

O sistema utiliza um esquema de cores personalizado baseado no tema "RedFem":

- **Primary Colors**: Tons de rosa (redfemPink, redfemActionPink, redfemDarkPink)
- **Background**: redfemVariantPink com opacidade
- **Interface**: Design responsivo com breakpoints em 1200px

## 🚨 Particularidades do Sistema

### Validação de Campos
- Campos obrigatórios são destacados com asterisco vermelho (*)
- Validação em tempo real durante o preenchimento
- Feedback visual para erros de validação

### Responsividade
- Interface adaptável para diferentes tamanhos de tela
- Breakpoints otimizados para uso em tablets e desktops
- Design mobile-friendly

### Segurança
- Sistema de autenticação baseado em tokens
- Controle de acesso por rotas
- Validação de permissões no frontend e backend

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de CORS**: Verifique se o backend está configurado corretamente
2. **Formulários não carregando**: Verifique se o usuário tem as permissões adequadas
3. **Relatórios não gerando**: Verifique se os dados do paciente estão completos

### Logs e Debugging
O sistema utiliza React Toastify para notificações de erro e sucesso. Verifique o console do navegador para erros detalhados.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a página de Ajuda dentro do sistema
2. Verifique a documentação de permissões
3. Entre em contato com o administrador do sistema

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

**Desenvolvido para otimizar o atendimento ginecológico através de tecnologia moderna e interface intuitiva.**