import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Componente para debug de permissões (apenas desenvolvimento)
 * Mostra informações sobre o usuário atual e suas permissões
 */
export default function PermissionDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    user,
    userCargo,
    cargoLabel,
    accessiblePages,
    isAdmin,
    isMedico,
    isRecepcionista,
    isResidente,
    isAcademico,
    canAccessUsers,
    canAccessPatients,
    canAccessForms,
    canAccessConsultas
  } = usePermissions();

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão para toggle */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors text-sm"
        title="Debug de Permissões"
      >
        🔐
      </button>

      {/* Panel de debug */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="text-sm space-y-2">
            <h3 className="font-bold text-gray-800 border-b pb-1">
              Debug de Permissões
            </h3>

            {/* Informações do usuário */}
            <div>
              <strong>Usuário:</strong> {user?.nome || user?.email || 'N/A'}
            </div>
            <div>
              <strong>Cargo:</strong> {userCargo || 'Não definido'} ({cargoLabel})
            </div>

            {/* Verificações de cargo */}
            <div className="border-t pt-2">
              <strong>Tipo de usuário:</strong>
              <ul className="ml-4 text-xs">
                <li>Admin: {isAdmin ? '✅' : '❌'}</li>
                <li>Médico: {isMedico ? '✅' : '❌'}</li>
                <li>Recepcionista: {isRecepcionista ? '✅' : '❌'}</li>
                <li>Residente: {isResidente ? '✅' : '❌'}</li>
                <li>Acadêmico: {isAcademico ? '✅' : '❌'}</li>
              </ul>
            </div>

            {/* Permissões por página */}
            <div className="border-t pt-2">
              <strong>Acesso às páginas:</strong>
              <ul className="ml-4 text-xs">
                <li>Usuários: {canAccessUsers ? '✅' : '❌'}</li>
                <li>Pacientes: {canAccessPatients ? '✅' : '❌'}</li>
                <li>Formulários: {canAccessForms ? '✅' : '❌'}</li>
                <li>Consultas: {canAccessConsultas ? '✅' : '❌'}</li>
              </ul>
            </div>

            {/* Páginas acessíveis */}
            <div className="border-t pt-2">
              <strong>Páginas acessíveis:</strong>
              <div className="text-xs">
                {accessiblePages.length > 0
                  ? accessiblePages.join(', ')
                  : 'Nenhuma'
                }
              </div>
            </div>

            {/* Botão para fechar */}
            <button
              onClick={() => setIsVisible(false)}
              className="w-full mt-2 bg-gray-200 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}