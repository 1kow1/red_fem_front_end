import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Map, Keyboard } from 'lucide-react';

/**
 * Menu de ajuda integrado com Tour Guiado e Ajuda F1
 * @param {Function} onStartTour - Callback para iniciar o tour guiado
 * @param {Function} onOpenHelp - Callback para abrir a ajuda contextual (F1)
 */
const HelpMenu = ({ onStartTour, onOpenHelp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTourClick = () => {
    setIsOpen(false);
    onStartTour?.();
  };

  const handleHelpClick = () => {
    setIsOpen(false);
    onOpenHelp?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Ícone de Ajuda */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-redfemHoverPink transition-colors"
        aria-label="Menu de Ajuda"
        title="Ajuda e Tour Guiado"
      >
        <HelpCircle
          size={24}
          className="text-redfemPink hover:text-redfemDarkPink transition-colors"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Tour Guiado */}
          <button
            onClick={handleTourClick}
            className="w-full px-4 py-3 text-left hover:bg-redfemHoverPink transition-colors flex items-center gap-3 group"
          >
            <Map
              size={20}
              className="text-redfemPink group-hover:text-redfemDarkPink"
            />
            <div>
              <div className="font-medium text-gray-800 group-hover:text-redfemDarkPink">
                Tour Guiado
              </div>
              <div className="text-xs text-gray-500">
                Passo a passo interativo
              </div>
            </div>
          </button>

          {/* Separador */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Ajuda F1 */}
          <button
            onClick={handleHelpClick}
            className="w-full px-4 py-3 text-left hover:bg-redfemHoverPink transition-colors flex items-center gap-3 group"
          >
            <Keyboard
              size={20}
              className="text-redfemPink group-hover:text-redfemDarkPink"
            />
            <div>
              <div className="font-medium text-gray-800 group-hover:text-redfemDarkPink">
                Ajuda Contextual
              </div>
              <div className="text-xs text-gray-500">
                Pressione F1
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default HelpMenu;
