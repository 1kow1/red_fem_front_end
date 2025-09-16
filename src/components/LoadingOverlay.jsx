import React from 'react';

/**
 * Componente de overlay de loading que congela a tela
 * @param {boolean} isVisible - Se o overlay deve ser exibido
 * @param {string} message - Mensagem a ser exibida (opcional)
 * @param {string} className - Classes CSS adicionais (opcional)
 */
export default function LoadingOverlay({
  isVisible = false,
  message = "Carregando...",
  className = ""
}) {
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 bg-black bg-opacity-60
        flex items-center justify-center z-[9999]
        backdrop-blur-sm
        ${className}
      `}
      style={{ pointerEvents: 'all' }} // Bloqueia todas as interações
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 border">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner animado mais visível */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-redfemActionPink border-r-redfemActionPink"></div>

          {/* Mensagem */}
          <div className="text-center">
            <p className="text-gray-800 font-semibold text-lg mb-1">
              {message}
            </p>
            <p className="text-gray-500 text-sm">
              Por favor, aguarde...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook personalizado para gerenciar o estado do loading overlay
 * @param {string} defaultMessage - Mensagem padrão
 * @returns {object} - Objeto com estado e funções de controle
 */
export function useLoadingOverlay(defaultMessage = "Carregando...") {
  const [isVisible, setIsVisible] = React.useState(false);
  const [message, setMessage] = React.useState(defaultMessage);

  const showLoading = (customMessage) => {
    if (customMessage) setMessage(customMessage);
    setIsVisible(true);
  };

  const hideLoading = () => {
    setIsVisible(false);
    setMessage(defaultMessage);
  };

  const updateMessage = (newMessage) => {
    setMessage(newMessage);
  };

  return {
    isVisible,
    message,
    showLoading,
    hideLoading,
    updateMessage,
    LoadingOverlay: () => (
      <LoadingOverlay isVisible={isVisible} message={message} />
    )
  };
}