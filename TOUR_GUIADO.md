# Sistema de Tour Guiado - Red Fem

## Visão Geral

Implementamos um sistema completo de tours guiados usando a biblioteca **Driver.js**, que permite criar passos interativos para guiar os usuários através das funcionalidades do sistema.

## Arquitetura

### 1. Hook Personalizado (`useGuidedTour.js`)
Localização: `src/hooks/useGuidedTour.js`

Hook React que gerencia o estado e controle dos tours:
- `startTour()` - Inicia o tour manualmente
- `startTourIfNotCompleted()` - Inicia automaticamente se o usuário ainda não viu
- `hasCompletedTour()` - Verifica se o tour foi completado
- `resetTour()` - Reseta o status (útil para testes)

### 2. Configurações de Tours (`toursConfig.js`)
Localização: `src/config/toursConfig.js`

Define todos os passos para cada página:
- **consultas** - 4 passos
- **formularios** - 5 passos
- **formulario-editor** - 5 passos
- **execucao-formulario** - 4 passos
- **pacientes** - 4 passos
- **usuarios** - 3 passos

### 3. Componente de Botão (`TourButton.jsx`)
Localização: `src/components/TourButton.jsx`

Botão estilizado para iniciar o tour manualmente.

## Como Integrar em uma Nova Página

### Passo 1: Adicionar Imports
```javascript
import { useGuidedTour } from "../hooks/useGuidedTour";
import { getTourForPage } from "../config/toursConfig";
import TourButton from "../components/TourButton";
```

### Passo 2: Inicializar o Hook
```javascript
export default function MinhaPage() {
  const tourSteps = getTourForPage('minha-pagina');
  const { startTour } = useGuidedTour('minha-pagina', tourSteps || []);

  // ... resto do código
}
```

### Passo 3: Adicionar o Botão no JSX
```javascript
return (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h1>Minha Página</h1>
      <TourButton onClick={startTour} />
    </div>
    {/* ... resto do conteúdo */}
  </div>
);
```

### Passo 4: Adicionar Atributos `data-tour` nos Elementos
Para que o tour funcione corretamente, adicione atributos `data-tour` nos elementos que você quer destacar:

```javascript
<button data-tour="filters-button">Filtros</button>
<div data-tour="consulta-details">...</div>
```

### Passo 5: Configurar os Passos do Tour
No arquivo `toursConfig.js`, adicione a configuração da sua página:

```javascript
export const toursConfig = {
  // ... tours existentes
  'minha-pagina': [
    {
      element: '[data-tour="meu-elemento"]',
      title: 'Título do Passo',
      description: 'Descrição detalhada do que fazer',
      side: 'bottom' // top, bottom, left, right
    },
    // ... mais passos
  ]
};
```

## Exemplo Completo: Página de Consultas

A página de Consultas (`src/pages/Consultas.jsx`) já está integrada como exemplo. Veja o código para referência.

## Personalização do Tour

### Textos em Português
O hook já está configurado com textos em português:
- "Próximo"
- "Anterior"
- "Concluir"
- "X de Y"

### Estilos
Os estilos do Driver.js são importados automaticamente. Para personalizar, você pode:

1. Criar um arquivo CSS customizado
2. Sobrescrever as classes do Driver.js
3. Modificar as cores no arquivo `tailwind.config.js`

### Comportamento Automático
Para iniciar o tour automaticamente na primeira visita do usuário:

```javascript
useEffect(() => {
  startTourIfNotCompleted();
}, []);
```

## Gerenciamento de Estado

O sistema usa `localStorage` para armazenar se o usuário já completou cada tour:
- Chave: `tour_completed_{tourId}`
- Valor: `'true'` ou não definido

### Resetar Tours (Desenvolvimento)
Para testar tours novamente:

```javascript
const { resetTour } = useGuidedTour('consultas', tourSteps);
resetTour(); // Limpa o localStorage
```

Ou manualmente no console do navegador:
```javascript
localStorage.clear(); // Remove todos os tours
// OU
localStorage.removeItem('tour_completed_consultas'); // Remove tour específico
```

## Boas Práticas

1. **Seletores Estáveis**: Use `data-tour` ao invés de classes CSS ou IDs
2. **Descrições Claras**: Seja específico e objetivo nas descrições
3. **Ordem Lógica**: Organize os passos na ordem natural de uso
4. **Posicionamento**: Escolha `side` e `align` para evitar sobreposições
5. **Teste em Diferentes Resoluções**: Verifique em desktop e mobile

## Páginas com Tour Implementado

✅ Consultas - Tour completo com 4 passos

## Próximos Passos (Pendentes)

- [ ] Integrar tour nas páginas:
  - Formulários
  - Editor de Formulários
  - Execução de Formulário
  - Pacientes
  - Usuários

- [ ] Adicionar atributos `data-tour` nos componentes
- [ ] Atualizar ContextualHelpModal para mencionar o tour guiado
- [ ] Testar tours em diferentes cenários

## Recursos

- [Driver.js Documentation](https://driverjs.com/)
- [Driver.js GitHub](https://github.com/kamranahmedse/driver.js)

## Suporte

Para dúvidas ou problemas, consulte este documento ou entre em contato com a equipe de desenvolvimento.
