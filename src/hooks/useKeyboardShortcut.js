import { useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar atalhos de teclado
 *
 * @param {string|string[]} keys - Tecla(s) a detectar (ex: 'F1', 'Control+s', ['Control+z', 'Meta+z'])
 * @param {Function} callback - Função a executar quando o atalho for pressionado
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.enabled - Se o atalho está habilitado (default: true)
 * @param {boolean} options.preventDefault - Se deve prevenir comportamento padrão (default: true)
 * @param {Array} options.dependencies - Dependências do useCallback (default: [])
 * @param {string} options.target - Alvo do evento: 'document' | 'window' (default: 'document')
 */
const useKeyboardShortcut = (keys, callback, options = {}) => {
  const {
    enabled = true,
    preventDefault = true,
    dependencies = [],
    target = 'document'
  } = options;

  // Normaliza as teclas para array
  const normalizedKeys = Array.isArray(keys) ? keys : [keys];

  // Função para verificar se a combinação de teclas foi pressionada
  const checkKeyMatch = useCallback((event, keyCombo) => {
    const parts = keyCombo.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);

    // Verifica a tecla principal
    const keyMatch = event.key.toLowerCase() === key ||
                     event.code.toLowerCase() === key.toLowerCase();

    if (!keyMatch) return false;

    // Verifica modificadores
    const hasControl = modifiers.includes('control') || modifiers.includes('ctrl');
    const hasAlt = modifiers.includes('alt');
    const hasShift = modifiers.includes('shift');
    const hasMeta = modifiers.includes('meta') || modifiers.includes('cmd');

    const controlMatch = hasControl ? event.ctrlKey : !event.ctrlKey;
    const altMatch = hasAlt ? event.altKey : !event.altKey;
    const shiftMatch = hasShift ? event.shiftKey : !event.shiftKey;
    const metaMatch = hasMeta ? event.metaKey : !event.metaKey;

    return controlMatch && altMatch && shiftMatch && metaMatch;
  }, []);

  // Handler do evento de teclado
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      // Verifica se alguma das combinações de teclas foi pressionada
      const isMatch = normalizedKeys.some(keyCombo =>
        checkKeyMatch(event, keyCombo)
      );

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        callback(event);
      }
    },
    [enabled, preventDefault, callback, normalizedKeys, checkKeyMatch, ...dependencies]
  );

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target === 'window' ? window : document;

    targetElement.addEventListener('keydown', handleKeyDown);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown, target]);
};

export default useKeyboardShortcut;
