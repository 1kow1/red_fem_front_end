import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Componente de Tooltip de Ajuda Contextual
 *
 * @param {Object} props
 * @param {string} props.title - Título do tooltip
 * @param {string} props.content - Conteúdo do tooltip (aceita HTML)
 * @param {string} props.position - Posição do tooltip: 'top' | 'bottom' | 'left' | 'right'
 * @param {string} props.size - Tamanho do ícone: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.showOnHover - Se true, mostra ao passar mouse (default: true)
 * @param {number} props.maxWidth - Largura máxima do tooltip em pixels (default: 300)
 */
const HelpTooltip = ({
  title,
  content,
  position = 'top',
  size = 'md',
  className = '',
  showOnHover = true,
  maxWidth = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  const handleMouseEnter = () => {
    if (showOnHover) setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (showOnHover) setIsVisible(false);
  };

  const handleClick = () => {
    if (!showOnHover) {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Ícone de Ajuda */}
      <button
        type="button"
        className="text-redfemPink hover:text-redfemDarkPink transition-colors cursor-help focus:outline-none focus:ring-2 focus:ring-redfemPink focus:ring-offset-1 rounded-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label="Ajuda contextual"
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]}`}
          style={{ maxWidth: `${maxWidth}px` }}
          role="tooltip"
        >
          {/* Seta do Tooltip */}
          <div
            className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
          />

          {/* Conteúdo do Tooltip */}
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 text-sm border border-gray-700 whitespace-normal">
            {title && (
              <div className="font-bold text-white mb-2">
                {title}
              </div>
            )}
            <div
              className="text-white leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{ color: '#ffffff', lineHeight: '1.5' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
