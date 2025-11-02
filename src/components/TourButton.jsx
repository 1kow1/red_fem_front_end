import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Botão para iniciar o tour guiado
 * @param {Function} onClick - Função chamada ao clicar no botão
 * @param {string} className - Classes CSS adicionais
 */
const TourButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-redfemPink hover:bg-redfemDarkPink text-white rounded-lg transition-colors shadow-md hover:shadow-lg ${className}`}
      title="Iniciar tour guiado"
      aria-label="Iniciar tour guiado desta página"
    >
      <HelpCircle size={20} />
      <span className="font-medium">Tour Guiado</span>
    </button>
  );
};

export default TourButton;
