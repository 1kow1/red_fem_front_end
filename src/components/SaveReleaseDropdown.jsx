import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/auth/useAuth';
import { canUseComponent } from '../utils/permissions';

export default function SaveReleaseDropdown({
  onSave,
  onSaveAndRelease,
  disabled = false,
  loading = false,
  isReleased = false
}) {
  const { user } = useAuth();
  const userCargo = user?.cargo;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    setIsOpen(false);
    onSave();
  };

  const handleSaveAndRelease = () => {
    setIsOpen(false);
    onSaveAndRelease();
  };

  if (isReleased) {
    return (
      <button
        disabled={true}
        className="px-4 py-2 h-fit rounded-md bg-gray-400 text-white cursor-not-allowed flex gap-2 items-center"
      >
        <Check size={16} />
        Liberado
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão dropdown único */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="px-4 py-2 h-fit rounded-md bg-redfemActionPink text-white hover:bg-redfemPink active:bg-redfemDarkPink disabled:bg-redfemLightGray flex gap-2 items-center whitespace-nowrap"
      >
        <Save size={16} />
        {loading ? 'Salvando...' : 'Salvar'}
        <ChevronDown size={16} />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Opções de Salvamento
            </div>

            <button
              onClick={handleSave}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50"
            >
              <Save size={18} className="mt-0.5 text-blue-500" />
              <div className="flex-1">
                <div className="font-medium">Salvar</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Salva o progresso atual sem liberar
                </div>
              </div>
            </button>

            {canUseComponent(userCargo, 'execucaoFormulario', 'salvarELiberar') && (
              <button
                onClick={handleSaveAndRelease}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-start gap-3"
              >
                <Check size={18} className="mt-0.5 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium">Salvar e Liberar</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Salva e libera definitivamente o formulário
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}