# Scripts de Utilidades

Este diretório contém scripts úteis para desenvolvimento e testes.

## 🚀 populate-browser.js (RECOMENDADO!)

**Melhor opção para popular a base de dados rapidamente!**

### Como usar:

1. **Faça login na aplicação** (http://localhost:5173)
2. **Abra o console do navegador:**
   - Pressione **F12** ou
   - Clique com botão direito → Inspecionar → Console
3. **Copie TODO o conteúdo do arquivo `populate-browser.js`**
4. **Cole no console** e pressione **Enter**
5. **Aguarde** - você verá o progresso em tempo real!

### O que será criado:
- ✅ 20 usuários (médicos, residentes, acadêmicos, recepcionistas)
- ✅ 50 pacientes com dados completos
- ✅ 30 consultas distribuídas

### Vantagens:
- ✨ Funciona perfeitamente (usa sua sessão autenticada)
- 🚀 Rápido e confiável
- 📊 Mostra progresso em tempo real
- 🔒 Não precisa de credenciais

---

## populate-database.js (Node.js - Experimental)

⚠️ **LIMITAÇÃO**: Este script tem problemas com autenticação baseada em cookies HttpOnly.

**Use o `populate-browser.js` ao invés deste.**

### Como usar (experimental)

1. **Instale as dependências (primeira vez apenas):**
   ```bash
   npm install axios-cookiejar-support tough-cookie http-cookie-agent
   ```

2. **Certifique-se de que o backend está rodando:**
   ```bash
   # O backend deve estar rodando em http://localhost:8003
   ```

3. **Execute o script:**
   ```bash
   node scripts/populate-database.js
   ```

⚠️ **Nota**: Se receber erro "Unauthorized", use o método alternativo em `INSTRUCOES_POPULACAO.md`.

### O que o script faz

O script cria automaticamente:

- ✅ **20 usuários** com diferentes cargos:
  - Médicos (com CRM e especialidade)
  - Residentes (com CRM e especialidade)
  - Acadêmicos
  - Recepcionistas

- ✅ **50 pacientes** com dados completos:
  - Nome, CPF, email e telefone
  - Data de nascimento (entre 18 e 80 anos)
  - Profissão
  - Endereço (cidades do Paraná)
  - Estado civil

- ✅ **30 consultas** distribuídas:
  - Entre os pacientes criados
  - Com médicos/residentes cadastrados
  - Datas entre 30 dias atrás e 90 dias no futuro
  - Horários entre 8h e 16h30

### Configurações

Você pode ajustar as quantidades no topo do arquivo `populate-database.js`:

```javascript
const NUM_USERS = 20;        // Número de usuários a criar
const NUM_PACIENTES = 50;    // Número de pacientes a criar
const NUM_CONSULTAS = 30;    // Número de consultas a criar
```

### Credenciais de Login

O script usa as seguintes credenciais para fazer login:
- **Email:** `admin@redefem.org.br`
- **Senha:** `senha123`

Ajuste essas credenciais no arquivo se necessário:

```javascript
const LOGIN_EMAIL = 'admin@redefem.org.br';
const LOGIN_PASSWORD = 'senha123';
```

### Credenciais dos dados criados

Todos os usuários criados pelo script terão a senha padrão:
- **Senha:** `senha123`

Os emails seguem o padrão:
- `[nome].[sobrenome][número]@email.com`
- Exemplo: `maria.silva123@email.com`

### Resolução de problemas

**Erro de conexão:**
- Verifique se o backend está rodando
- Confirme a URL: `http://localhost:8003`

**Erro de autenticação:**
- Verifique se as credenciais de login estão corretas
- Certifique-se de que existe um usuário administrador

**Alguns registros falharam:**
- É normal que alguns registros falhem por duplicação de CPF ou email
- O script continuará criando os demais registros

### Observações

- 📝 Os dados são **totalmente fictícios** e gerados aleatoriamente
- 🔄 Você pode executar o script múltiplas vezes (alguns registros podem falhar por duplicação)
- 🎲 CPFs, emails e telefones são gerados randomicamente
- 🏥 Apenas pacientes do sexo feminino são criados (adequado ao contexto da aplicação)
- 📅 As consultas são distribuídas ao longo de 4 meses (30 dias atrás a 90 dias no futuro)
